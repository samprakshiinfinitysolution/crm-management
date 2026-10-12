"use client";

import { io, Socket } from "socket.io-client";

export const WS_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  NOTIFICATION_NEW: "notification:new",
  LEAD_ASSIGNED: "lead:assigned",
  LEAD_REASSIGNED: "lead:reassigned",
  LEAD_STATUS_CHANGED: "lead:status_changed",
  FOLLOWUP_DUE: "followup:due",
  DASHBOARD_METRICS_UPDATE: "dashboard:metrics_update",
} as const;

let socket: Socket | null = null;

export const getSocketUrl = (): string => {
  // 1. Explicitly configured WebSocket URL takes highest precedence
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // 2. If API URL is absolute (e.g. http://localhost:5000/api or http://192.168.1.9:5000/api)
  if (apiUrl.startsWith("http://") || apiUrl.startsWith("https://")) {
    return apiUrl.replace(/\/api\/?$/, "");
  }

  // 3. If API URL is relative (e.g. "/api"), the app is served same-origin and
  //    Next.js rewrites both /api and /socket.io to the backend. Connecting to
  //    the current origin lets the /socket.io rewrite proxy the WebSocket to the
  //    backend. Hard-coding :5000 here bypasses that proxy and fails whenever the
  //    backend is not exposed on port 5000 of the frontend host (e.g. production).
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:5000";
};

export const getSocket = (): Socket => {
  if (!socket) {
    const wsUrl = getSocketUrl();
    socket = io(wsUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ["websocket", "polling"],
    });
  }

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
