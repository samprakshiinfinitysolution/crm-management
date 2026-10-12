import http from "http";
import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { prisma } from "./config/db.js";
import { initSocketServer } from "./config/socket.js";
import { closeRedis } from "./config/redis.js";
import { KeepAliveService } from "./services/keepAlive.service.js";
import { UserService } from "./services/user.service.js";

const app = createApp();
const server = http.createServer(app);

// Socket.IO instance. May remain null if initialization fails — the HTTP API
// and port binding MUST succeed regardless of the real-time layer.
let io: ReturnType<typeof initSocketServer> | null = null;

// ---------------------------------------------------------------------------
// Process-level safety net
// ---------------------------------------------------------------------------
// Node exits the process on an unhandled rejection / uncaught exception by
// default, which on Render surfaces only as the opaque "No open ports detected"
// message with no stack trace. Log them so the real cause is visible and a
// transient Redis/Socket.IO error can never take the instance down.
process.on("unhandledRejection", (reason) => {
  console.error("🔥 Unhandled Promise Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});

// Bind the port FIRST so Render's port scanner detects it immediately,
// independent of any slower Socket.IO / Redis initialization below.
server.listen(config.port, '0.0.0.0', async () => {
  console.log(`===============================================`);
  console.log(`🚀 CRM Backend Server running in ${config.nodeEnv} mode`);
  console.log(`📡 URL: http://localhost:${config.port}`);
  console.log(`🩺 Health check: http://localhost:${config.port}/api/health`);
  console.log(`🩺 Readiness: http://localhost:${config.port}/api/health/ready`);

  try {
    await prisma.$connect();
    console.log(`✅ Database connected successfully`);
    await UserService.bootstrapAdminUser();
  } catch (error) {
    console.error(
      `❌ Database connection failed: Could not connect to PostgreSQL.`,
    );
    console.error(
      `👉 Please ensure PostgreSQL is running at localhost:5432 or update DATABASE_URL in .env`,
    );
  }

  console.log(`===============================================`);

  // Start keep-alive cron job to prevent Render container from sleeping
  KeepAliveService.start();
});

// Initialize Socket.IO / Redis adapter AFTER the port is bound. Guarded so a
// failure here can never prevent the HTTP server from accepting traffic.
try {
  io = initSocketServer(server);
  console.log(`🔌 WebSocket Server active on port ${config.port}`);
} catch (error) {
  console.error("⚠️ Socket.IO initialization failed; continuing without the real-time layer:", error);
  io = null;
}

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  KeepAliveService.stop();

  // Stop accepting new Socket.IO connections and let in-flight ones finish so
  // the load balancer can drain this instance cleanly during rolling deploys.
  try {
    io?.close(() => console.log("WebSocket server closed."));
  } catch {
    // io may be null if Socket.IO failed to initialize; safe to ignore.
  }

  server.close(async () => {
    await prisma.$disconnect();
    await closeRedis();
    console.log("HTTP server, Database, and Redis connections closed.");
    process.exit(0);
  });

  // Force shutdown after timeout
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default server;
