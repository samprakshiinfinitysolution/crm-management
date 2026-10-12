import { Server as SocketIOServer, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import type { Server as HttpServer } from "http";
import type { Server as HttpsServer } from "https";
import jwt from "jsonwebtoken";

import { config } from "./env.js";
import { prisma } from "./db.js";
import { getRedisPubSubPair } from "./redis.js";
import { isOriginAllowed } from "./allowedOrigins.js";
import { UserRole } from "../types/index.js";

export interface AuthenticatedSocketUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: AuthenticatedSocketUser;
  };
}

export interface NotificationPayload {
  id?: string;
  recipientUserId?: string;
  title: string;
  message: string;
  type?: string;
  isRead?: boolean;
  createdAt?: Date | string;
  metadata?: Record<string, unknown>;
}

// WebSocket Event Constants
export const WS_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_READ: "notification:read",
  NOTIFICATION_READ_ALL: "notification:read_all",
  NOTIFICATION_COUNT: "notification:count",
  LEAD_ASSIGNED: "lead:assigned",
  LEAD_REASSIGNED: "lead:reassigned",
  LEAD_STATUS_CHANGED: "lead:status_changed",
  FOLLOWUP_DUE: "followup:due",
  DASHBOARD_METRICS_UPDATE: "dashboard:metrics_update",
  MESSAGE: "message",
  MESSAGE_NEW: "message:new",
} as const;

let io: SocketIOServer | null = null;

export const initSocketServer = (
  server: HttpServer | HttpsServer,
): SocketIOServer => {
  // ==================================================
  // Socket.IO server
  // ==================================================

  io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }
        if (isOriginAllowed(origin)) {
          return callback(null, origin);
        }
        return callback(new Error("CORS origin not allowed"), false);
      },

      credentials: true,

      methods: ["GET", "POST"],
    },

    addTrailingSlash: false,

    pingTimeout: 60000,

    pingInterval: 25000,
  });

  // ==================================================
  // Redis Adapter (horizontal scaling)
  // ==================================================
  // With multiple backend instances behind the load balancer, a socket can be
  // connected to instance A while the emitting code runs on instance B. The
  // default in-memory adapter would drop those events. The Redis adapter
  // mirrors rooms/user channels across all instances via pub/sub, so
  // emitToUser()/sendNotificationToUser() keep working unchanged.
  //
  // Falls back to the in-memory adapter when Redis is not configured
  // (local dev / single instance), preserving current behaviour.
  const pubSubPair = getRedisPubSubPair();
  if (pubSubPair) {
    try {
      io.adapter(createAdapter(pubSubPair.pub, pubSubPair.sub));
      console.log(
        "🔗 Socket.IO Redis adapter attached (multi-instance ready)",
      );
    } catch (adapterError) {
      // A failure to attach the adapter must never crash startup; fall back to
      // the in-memory adapter so the port stays bound and HTTP keeps serving.
      console.warn(
        "⚠️ Failed to attach Socket.IO Redis adapter; using in-memory adapter:",
        adapterError,
      );
    }
  } else {
    console.log(
      "🔗 Socket.IO using in-memory adapter (Redis not configured)",
    );
  }

  // ==================================================
  // JWT Authentication Middleware
  // ==================================================

  io.use((socket: AuthenticatedSocket, next) => {
    try {
      /**
       * Get token from:
       *
       * 1. Socket.IO auth
       * 2. Authorization header
       * 3. Query parameter
       * 4. Cookie
       */
      const authHeader =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization ||
        socket.handshake.query?.token;

      let token: string | undefined;

      // ------------------------------------------------
      // Extract token from auth/header/query
      // ------------------------------------------------

      if (typeof authHeader === "string") {
        token = authHeader.startsWith("Bearer ")
          ? authHeader.slice(7).trim()
          : authHeader.trim();
      }

      // ------------------------------------------------
      // Check cookie if token wasn't found
      // ------------------------------------------------

      if (!token && socket.handshake.headers?.cookie) {
        const cookies = socket.handshake.headers.cookie.split(";");

        for (const cookie of cookies) {
          const [key, ...valueParts] = cookie.trim().split("=");

          if (
            key === config.tokenKey ||
            key === "token" ||
            key === "CRM_Management" ||
            key === "crm_auth_token"
          ) {
            token = valueParts.join("=").trim();
            break;
          }
        }
      }

      // ------------------------------------------------
      // Token is mandatory
      // ------------------------------------------------

      if (!token) {
        console.warn(
          `⚠️ WebSocket authentication rejected: no token | Socket: ${socket.id}`,
        );

        return next(new Error("Unauthorized"));
      }

      // ------------------------------------------------
      // Verify JWT
      // ------------------------------------------------

      const decoded = jwt.verify(
        token,
        config.jwt.secret,
      ) as AuthenticatedSocketUser;

      // ------------------------------------------------
      // Validate required JWT claims
      // ------------------------------------------------

      if (
        !decoded ||
        typeof decoded !== "object" ||
        !decoded.id ||
        !decoded.email ||
        !decoded.role
      ) {
        console.warn(
          `⚠️ WebSocket authentication rejected: invalid token payload | Socket: ${socket.id}`,
        );

        return next(new Error("Unauthorized"));
      }

      // ------------------------------------------------
      // Validate role
      // ------------------------------------------------

      if (!Object.values(UserRole).includes(decoded.role)) {
        console.warn(
          `⚠️ WebSocket authentication rejected: invalid role | Socket: ${socket.id}`,
        );

        return next(new Error("Unauthorized"));
      }

      // ------------------------------------------------
      // Store authenticated user
      // ------------------------------------------------

      socket.data.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      return next();
    } catch (err) {
      console.warn(
        "⚠️ WebSocket connection authentication error:",
        err instanceof Error ? err.message : err,
      );

      // IMPORTANT:
      // Never allow the socket to connect after
      // authentication failure.
      return next(new Error("Unauthorized"));
    }
  });

  // ==================================================
  // Authenticated Socket Connection
  // ==================================================

  io.on("connection", (socket: AuthenticatedSocket) => {
    const user = socket.data?.user;

    // Authentication middleware guarantees that user
    // exists, but keep this defensive check.
    if (!user) {
      console.warn(
        `⚠️ Socket connected without authenticated user: ${socket.id}`,
      );

      socket.disconnect(true);
      return;
    }

    // ------------------------------------------------
    // Join personal user room
    // ------------------------------------------------

    const userRoom = `user:${user.id}`;

    socket.join(userRoom);

    // ------------------------------------------------
    // Join role room
    // ------------------------------------------------

    const roleRoom = `role:${user.role}`;

    socket.join(roleRoom);

    console.log(
      `🔌 WS Client connected: ${socket.id} | User: ${user.email} (${user.role})`,
    );

    // ==================================================
    // Notification: Mark specific notification as read
    // ==================================================

    socket.on(
      WS_EVENTS.NOTIFICATION_READ,
      async (
        data: {
          notificationId?: string;
          id?: string;
        },
        ack?: (res: unknown) => void,
      ) => {
        try {
          const notificationId = data?.notificationId || data?.id;

          if (!notificationId) {
            ack?.({
              success: false,
              message: "notificationId is required",
            });

            return;
          }

          const updated = await prisma.notification.updateMany({
            where: {
              id: notificationId,
              recipientUserId: user.id,
            },

            data: {
              isRead: true,
              readAt: new Date(),
            },
          });

          const unreadCount = await prisma.notification.count({
            where: {
              recipientUserId: user.id,
              isRead: false,
            },
          });

          socket.emit(WS_EVENTS.NOTIFICATION_COUNT, {
            unreadCount,
          });

          ack?.({
            success: true,
            count: updated.count,
            unreadCount,
          });
        } catch (error) {
          console.error(
            "Error marking notification as read via socket:",
            error,
          );

          ack?.({
            success: false,
            message: "Failed to mark notification as read",
          });
        }
      },
    );

    // ==================================================
    // Notification: Mark all as read
    // ==================================================

    socket.on(
      WS_EVENTS.NOTIFICATION_READ_ALL,
      async (_data?: unknown, ack?: (res: unknown) => void) => {
        try {
          await prisma.notification.updateMany({
            where: {
              recipientUserId: user.id,
              isRead: false,
            },

            data: {
              isRead: true,
              readAt: new Date(),
            },
          });

          socket.emit(WS_EVENTS.NOTIFICATION_COUNT, {
            unreadCount: 0,
          });

          ack?.({
            success: true,
            unreadCount: 0,
          });
        } catch (error) {
          console.error(
            "Error marking all notifications as read via socket:",
            error,
          );

          ack?.({
            success: false,
            message: "Failed to mark all notifications as read",
          });
        }
      },
    );

    // ==================================================
    // Notification: Get unread count
    // ==================================================

    socket.on(
      "notification:get_unread_count",
      async (_data?: unknown, ack?: (res: unknown) => void) => {
        try {
          const unreadCount = await prisma.notification.count({
            where: {
              recipientUserId: user.id,
              isRead: false,
            },
          });

          socket.emit(WS_EVENTS.NOTIFICATION_COUNT, {
            unreadCount,
          });

          ack?.({
            success: true,
            unreadCount,
          });
        } catch (error) {
          ack?.({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to get unread count",
          });
        }
      },
    );

    // ==================================================
    // Lead assigned listener
    // ==================================================

    // ==================================================
    // Conversation room join / leave
    // ==================================================

    socket.on(
      "conversation:join",
      (data: { conversationId?: string }) => {
        if (data?.conversationId) {
          socket.join(`conversation:${data.conversationId}`);
        }
      },
    );

    socket.on(
      "conversation:leave",
      (data: { conversationId?: string }) => {
        if (data?.conversationId) {
          socket.leave(`conversation:${data.conversationId}`);
        }
      },
    );

    socket.on(WS_EVENTS.LEAD_ASSIGNED, (data: unknown) => {
      console.log(
        `📋 Lead assigned event received from socket ${socket.id}:`,
        data,
      );
    });

    // ==================================================
    // Disconnect
    // ==================================================

    socket.on("disconnect", (reason) => {
      console.log(`🔌 WS Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

// ======================================================
// Get Socket.IO instance
// ======================================================

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error(
      "Socket.io has not been initialized. Call initSocketServer first.",
    );
  }

  return io;
};

// ======================================================
// Helper Emission Functions
// ======================================================

export const sendNotificationToUser = (
  userId: string,
  notification: NotificationPayload,
): void => {
  if (!io) return;

  io.to(`user:${userId}`).emit(WS_EVENTS.NOTIFICATION_NEW, notification);
};

export const sendNotificationToRole = (
  role: UserRole,
  notification: NotificationPayload,
): void => {
  if (!io) return;

  io.to(`role:${role}`).emit(WS_EVENTS.NOTIFICATION_NEW, notification);
};

export const broadcastNotification = (
  notification: NotificationPayload,
): void => {
  if (!io) return;

  io.emit(WS_EVENTS.NOTIFICATION_NEW, notification);
};

export const createAndEmitNotification = async (params: {
  recipientUserId: string;
  title: string;
  message: string;
  type?: string;
}) => {
  const { recipientUserId, title, message, type = "SYSTEM" } = params;

  try {
    const notification = await prisma.notification.create({
      data: {
        recipientUserId,
        title,
        message,
        type,
      },
    });

    sendNotificationToUser(recipientUserId, notification);

    return notification;
  } catch (error) {
    console.error("Failed to create and emit notification:", error);

    sendNotificationToUser(recipientUserId, {
      title,
      message,
      type,
    });

    return null;
  }
};

export const emitToUser = (
  userId: string,
  event: string,
  payload: unknown,
): void => {
  if (!io) return;

  io.to(`user:${userId}`).emit(event, payload);
};

export const emitToRole = (
  role: UserRole,
  event: string,
  payload: unknown,
): void => {
  if (!io) return;

  io.to(`role:${role}`).emit(event, payload);
};

export const emitToAll = (event: string, payload: unknown): void => {
  if (!io) return;

  io.emit(event, payload);
};

export const emitToConversation = (
  conversationId: string,
  event: string,
  payload: unknown,
): void => {
  if (!io) return;

  io.to(`conversation:${conversationId}`).emit(event, payload);
};
