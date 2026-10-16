import { config } from "./env.js";

/**
 * Centralized allowed-origin resolution shared by the CORS layer (app.ts) and
 * the CSRF `verifyOrigin` middleware. Keeping a single source of truth prevents
 * the two layers from drifting apart and accidentally allowing wildcard access
 * for credentialed requests.
 */

/** Split a comma-separated origin list, trimming whitespace and trailing slashes. */
export const parseOrigins = (input: string): string[] =>
  input
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean);

/** Development origins permitted without extra configuration. */
const DEV_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://192.168.1.5:3000",
  "http://192.168.1.10:3000",
];

/**
 * Build the full set of explicitly allowed browser origins from validated
 * environment configuration plus local development origins. Never includes a
 * wildcard ("*") — credentialed requests must always target exact origins.
 */
export const getAllowedOrigins = (): Set<string> => {
  const configuredClientOrigins = parseOrigins(config.clientUrl || "");
  const envAllowedOrigins = parseOrigins(process.env.ALLOWED_ORIGINS || "");

  return new Set<string>([
    ...configuredClientOrigins,
    ...envAllowedOrigins,
    // Local development origins are only trusted outside production.
    ...(config.nodeEnv === "production" ? [] : DEV_ORIGINS),
  ]);
};

/** True when the provided origin matches an allowed origin (or trusted deployment domain). */
export const isOriginAllowed = (origin: string): boolean => {
  const normalized = origin.replace(/\/+$/, "");
  if (getAllowedOrigins().has(normalized)) return true;
  // Allow local LAN IPs in development mode (e.g. http://192.168.x.x:3000, http://10.x.x.x:3000)
  if (config.nodeEnv !== "production") {
    if (
      /^http:\/\/(?:192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?::\d+)?$/i.test(
        normalized,
      )
    ) {
      return true;
    }
  }
  // Allow Vercel deployment preview and production domains
  if (/^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/i.test(normalized)) {
    return true;
  }
  // Allow Render deployment domains
  if (/^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.onrender\.com$/i.test(normalized)) {
    return true;
  }
  return false;
};
