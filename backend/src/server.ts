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

// Initialize WebSocket / Socket.io Server
const io = initSocketServer(server);

server.listen(config.port, '0.0.0.0', async () => {
  console.log(`===============================================`);
  console.log(`🚀 CRM Backend Server running in ${config.nodeEnv} mode`);
  console.log(`📡 URL: http://localhost:${config.port}`);
  console.log(`🔌 WebSocket Server active on port ${config.port}`);
  console.log(`🩺 Health check: http://localhost:${config.port}/api/health`);

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

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  KeepAliveService.stop();

  // Stop accepting new Socket.IO connections and let in-flight ones finish so
  // the load balancer can drain this instance cleanly during rolling deploys.
  try {
    io.close(() => console.log("WebSocket server closed."));
  } catch {
    // io may be undefined in some test contexts; safe to ignore.
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
