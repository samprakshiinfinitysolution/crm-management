import dotenv from "dotenv";
import type jwt from "jsonwebtoken";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const jwtSecret = process.env.JWT_SECRET?.trim();

if (
  nodeEnv === "production" &&
  (!jwtSecret || jwtSecret === "crm_default_secret_key_change_in_production")
) {
  throw new Error("FATAL: A secure JWT_SECRET is required in production.");
}

if (!jwtSecret) {
  throw new Error("FATAL: JWT_SECRET environment variable is required.");
}

if (jwtSecret === "crm_default_secret_key_change_in_production") {
  throw new Error(
    "FATAL: JWT_SECRET cannot use the default placeholder value.",
  );
}

const parseTtlMs = (val?: string): number => {
  if (!val) return 7 * 24 * 60 * 60 * 1000;
  const cleaned = val.replace(/['"]/g, "").trim();
  if (cleaned.includes("*")) {
    const parts = cleaned.split("*").map((p) => parseFloat(p.trim()));
    if (parts.every((p) => !isNaN(p))) {
      return parts.reduce((acc, curr) => acc * curr, 1);
    }
  }
  const parsed = parseInt(cleaned, 10);
  return !isNaN(parsed) && parsed > 0 ? parsed : 7 * 24 * 60 * 60 * 1000;
};

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,

  nodeEnv,

  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",

  jwt: {
    secret: jwtSecret,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET?.replace(/['"]/g, "").trim() || jwtSecret,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET?.replace(/['"]/g, "").trim() || jwtSecret,
    accessTokenExpiresIn: (process.env.ACCESS_TOKEN_EXPIRY?.replace(/['"]/g, "").trim() || "15m") as jwt.SignOptions["expiresIn"],
    refreshTokenExpiresIn: (process.env.REFRESH_TOKEN_EXPIRY?.replace(/['"]/g, "").trim() || "7d") as jwt.SignOptions["expiresIn"],
    refreshTokenTtlMs: parseTtlMs(process.env.REFRESH_TOKEN_TTL_MS),
    expiresIn: process.env.JWT_EXPIRES_IN?.replace(/['"]/g, "").trim() || "7d",
  },

  tokenKey: process.env.AUTH_COOKIE_NAME || process.env.TOKEN_KEY || "CRM_Management",

  databaseUrl: process.env.DATABASE_URL || "",

  directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL || "",

  redis: {
    url: process.env.REDIS_URL || "",

    host: process.env.REDIS_HOST || "",

    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,

    password: process.env.REDIS_PASSWORD || undefined,

    defaultTtlSeconds: process.env.REDIS_DEFAULT_TTL
      ? parseInt(process.env.REDIS_DEFAULT_TTL, 10)
      : 3600,

    sessionTtlSeconds: process.env.SESSION_TTL_SECONDS
      ? parseInt(process.env.SESSION_TTL_SECONDS, 10)
      : 7 * 24 * 3600,
  },

  serverUrl: process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || process.env.SERVER_URL || '',

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    folder: process.env.CLOUDINARY_FOLDER || "crm-chat",
  },


  keepAlive: {
    enabled: process.env.ENABLE_KEEP_ALIVE !== 'false',
    intervalMinutes: process.env.KEEP_ALIVE_INTERVAL_MINUTES
      ? parseInt(process.env.KEEP_ALIVE_INTERVAL_MINUTES, 10)
      : 14,
  },

  admin: {
    name: process.env.ADMIN_NAME || "Admin",
    email: process.env.ADMIN_EMAIL || "admin@leadflow.io",
    // No hardcoded fallback: the superuser password must come from the
    // environment. `user.service.ts` skips bootstrap when this is empty.
    password: process.env.ADMIN_PASSWORD || "",
  },

  /**
   * Interactive API documentation (Swagger UI) exposure.
   *
   * `docsEnabled` gates the whole `/api/docs` surface at the router level.
   * Default is OFF in production so an unauthenticated deployment never serves
   * the API contract or its login helpers. Set ENABLE_API_DOCS=true to opt in.
   */
  docs: {
    enabled: resolveDocsEnabled(),
  },
};

function resolveDocsEnabled(): boolean {
  const raw = (process.env.ENABLE_API_DOCS || "").trim().toLowerCase();

  // Explicit opt-in always wins.
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  if (raw === "false" || raw === "0" || raw === "no") return false;

  // Unset: allow locally, block in production.
  return nodeEnv !== "production";
}
