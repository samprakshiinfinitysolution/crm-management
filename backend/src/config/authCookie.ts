import type { CookieOptions } from "express";
import { config } from "./env.js";

/** Browser requests reach the backend through the same-origin Next.js /api rewrite. */
export const getAuthCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "lax",
  path: "/",
  maxAge: config.redis.sessionTtlSeconds * 1000,
});

export const clearAuthCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "lax",
  path: "/",
});

/** Refresh Token Cookie Options: 7-day TTL, HTTP-Only, Secure in production */
export const getRefreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "lax",
  path: "/",
  maxAge: config.jwt.refreshTokenTtlMs, // 7 days (or configured REFRESH_TOKEN_TTL_MS)
});

export const clearRefreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "lax",
  path: "/",
});
