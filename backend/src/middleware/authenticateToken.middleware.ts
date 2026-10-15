import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import { AuthRequest, AuthenticatedUser, UserRole } from '../types/index.js';
import { prisma } from '../config/db.js';
import { CacheService } from '../services/cache.service.js';
import { getAccessTokenSecret } from '../utils/token.helper.js';

/**
 * Express Middleware: authenticateToken
 * Strictly validates the 15-minute Bearer Access Token from the HTTP Authorization header.
 * Attaches the verified user payload { id, email, name, role } to req.user.
 */
export const authenticateToken = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required: Bearer access token missing', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Authentication required: Token malformed', 401, 'UNAUTHORIZED');
    }

    // 1. Check if token was explicitly revoked/blacklisted in Redis
    try {
      const isBlacklisted = await CacheService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new AppError('Session has expired or token was revoked. Please log in again.', 401, 'TOKEN_REVOKED');
      }
    } catch {
      // Redis network fault resilience: continue to cryptographic check
    }

    // 2. Cryptographic signature & expiry verification (15m window)
    let decoded: AuthenticatedUser;
    try {
      decoded = jwt.verify(token, getAccessTokenSecret()) as AuthenticatedUser;
    } catch (jwtError: any) {
      if (jwtError?.name === 'TokenExpiredError') {
        throw new AppError('Access token has expired. Please refresh your session.', 401, 'TOKEN_EXPIRED');
      }
      throw new AppError('Invalid access token. Authentication failed.', 401, 'INVALID_TOKEN');
    }

    // 3. Fast-path: Check Redis cache for active session & user status
    try {
      const cachedSession = await CacheService.getUserSession(decoded.id);
      if (cachedSession) {
        if (!cachedSession.isActive) {
          throw new AppError('User account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
        }
        req.user = {
          id: cachedSession.id,
          email: cachedSession.email,
          name: cachedSession.name,
          role: cachedSession.role,
        };
        return next();
      }

      // 4. Fallback: PostgreSQL database check if Redis missed
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, role: true, isActive: true, isDeleted: true },
      });

      if (!dbUser || !dbUser.isActive || dbUser.isDeleted) {
        throw new AppError('User account is inactive or not found', 401, 'UNAUTHORIZED');
      }

      // Re-warm Redis cache
      await CacheService.saveUserSession(dbUser.id, {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role as unknown as UserRole,
        isActive: dbUser.isActive,
      });

      req.user = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role as UserRole,
      };

      return next();
    } catch (cacheOrDbError) {
      if (cacheOrDbError instanceof AppError) {
        throw cacheOrDbError;
      }
      // Fail-safe: if DB/cache are temporarily unreachable, trust cryptographically verified claims
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name || 'User',
        role: decoded.role as UserRole,
      };
      return next();
    }
  } catch (error) {
    next(error);
  }
};
