import dotenv from "dotenv";

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

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,

  nodeEnv,

  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",

  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
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
    password: process.env.ADMIN_PASSWORD || "Samprakshi@4562",
  },
};
