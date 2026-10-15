import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { UserRole } from '../types/index.js';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface RefreshTokenPayload {
  id: string;
  family: string;
  jti?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  family: string;
}

export const ACCESS_TOKEN_EXPIRY = config.jwt.accessTokenExpiresIn;
export const REFRESH_TOKEN_EXPIRY = config.jwt.refreshTokenExpiresIn;
export const REFRESH_TOKEN_TTL_MS = config.jwt.refreshTokenTtlMs;

/**
 * Access Token Secret: supports dedicated secret with fallback to standard JWT secret
 */
export const getAccessTokenSecret = (): string => {
  return config.jwt.accessTokenSecret;
};

/**
 * Refresh Token Secret: supports dedicated secret with fallback to standard JWT secret
 */
export const getRefreshTokenSecret = (): string => {
  return config.jwt.refreshTokenSecret;
};

/**
 * Generates short-lived (15-minute) Access Token containing user claims
 */
export const generateAccessToken = (user: TokenPayload): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    getAccessTokenSecret(),
    { expiresIn: ACCESS_TOKEN_EXPIRY } as jwt.SignOptions
  );
};

/**
 * Generates long-lived (7-day) Refresh Token bound to a rotation family.
 * Embeds user identity (id, email, role, name) so edge middleware/proxies
 * can authorize route access directly from the session cookie.
 */
export const generateRefreshToken = (
  userOrId: string | TokenPayload,
  family: string
): string => {
  const payload =
    typeof userOrId === 'string'
      ? { id: userOrId, family, jti: crypto.randomUUID() }
      : {
          id: userOrId.id,
          email: userOrId.email,
          role: userOrId.role,
          name: userOrId.name,
          family,
          jti: crypto.randomUUID(),
        };

  return jwt.sign(
    payload,
    getRefreshTokenSecret(),
    { expiresIn: REFRESH_TOKEN_EXPIRY } as jwt.SignOptions
  );
};

/**
 * Generates both Access and Refresh Tokens with rotation family tracking
 */
export const generateTokenPair = (
  user: TokenPayload,
  existingFamily?: string
): TokenPair => {
  const family = existingFamily || crypto.randomUUID();
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, family);
  return { accessToken, refreshToken, family };
};

/**
 * SHA-256 hash helper: ensures plaintext refresh tokens are never stored in the database
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verifies and decodes a Refresh Token string
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, getRefreshTokenSecret()) as RefreshTokenPayload;
};
