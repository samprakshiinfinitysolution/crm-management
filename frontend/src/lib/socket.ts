"use client";

import { io, Socket } from "socket.io-client";

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
  USER_STATUS_CHANGED: "user:status_changed",
  USERS_ONLINE_LIST: "users:online_list",
  USERS_GET_ONLINE: "users:get_online",
} as const;

let socket: Socket | null = null;
let registeredToken: string | null = null;

export const getSocketUrl = (): string => {
  // 1. Explicitly configured WebSocket URL (e.g. dedicated WSS gateway or CDN endpoint)
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL.trim().replace(/\/+$/, "");
  }

  // 2. Explicitly configured backend URL override
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.trim()
      .replace(/\/api\/?$/, "")
      .replace(/\/+$/, "");
  }

  // 3. Browser environment resolution:
  // When running behind a reverse proxy (Nginx / Caddy / Cloudflare / Docker),
  // connecting to same-origin path /socket.io ensures the remote address shown in
  // browser DevTools is the reverse proxy domain/IP and NOT the backend's private address.
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Local development standalone without reverse proxy: direct to port 5000
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1"
    ) {
      // In local dev, check if running behind a local reverse proxy or direct
      return `${window.location.protocol}//${hostname}:5000`;
    }

    // In production behind reverse proxy: connect to frontend/proxy origin.
    // The reverse proxy intercepts /socket.io/ and forwards to the private backend.
    return window.location.origin;
  }

  return "http://localhost:5000";
};

export const getSocket = (token?: string | null): Socket => {
  const effectiveToken =
    token ||
    (typeof window !== "undefined"
      ? localStorage.getItem("crm_auth_token")
      : null);

  if (socket) {
    // If we have a new token and socket auth isn't aligned yet
    if (effectiveToken && effectiveToken !== registeredToken) {
      registeredToken = effectiveToken;
      socket.auth = { token: effectiveToken };
      if (socket.io?.opts) {
        (socket.io.opts.query as Record<string, string>) = { token: effectiveToken };
      }
      if (!socket.connected) {
        socket.connect();
      }
    }
    return socket;
  }

  const wsUrl = getSocketUrl();
  registeredToken = effectiveToken || null;

  socket = io(wsUrl, {
    auth: effectiveToken ? { token: effectiveToken } : undefined,
    query: effectiveToken ? { token: effectiveToken } : undefined,
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 25,
    reconnectionDelay: 1000,
    transports: ["websocket", "polling"],
  });

  return socket;
};

export const updateSocketToken = (token: string): void => {
  registeredToken = token;
  if (socket) {
    socket.auth = { token };
    if (socket.io?.opts) {
      (socket.io.opts.query as Record<string, string>) = { token };
    }
    if (!socket.connected) {
      socket.connect();
    }
  }
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    registeredToken = null;
  }
};
