import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { AppError } from './errorHandler.js';
import { UserRole, AuthRequest, AuthenticatedUser } from '../types/index.js';
import { prisma } from '../config/db.js';
import { CacheService } from '../services/cache.service.js';

/**
 * Authentication Middleware
 * Extracts and verifies JWT from Authorization Header or Cookie.
 * Validates session against Redis Cache with database fallback for zero-logout across deployments.
 * Attaches verified user context to req.user.
 */
export const authenticateUser = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies) {
    token =
      req.cookies[config.tokenKey];
  }

  if (!token) {
    return next(new AppError('Authentication token required', 401, 'UNAUTHORIZED'));
  }

  // 1. Check if token was explicitly revoked/blacklisted
  try {
    const isBlacklisted = await CacheService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return next(new AppError('Session has expired. Please log in again.', 401, 'TOKEN_REVOKED'));
    }
  } catch {
    // Ignore Redis connectivity issues
  }

  // 2. Verify JWT signature against persistent secret
  let decoded: AuthenticatedUser;
  try {
    decoded = jwt.verify(token, config.jwt.secret) as AuthenticatedUser;
  } catch (jwtError: any) {
    if (jwtError?.name === 'TokenExpiredError') {
      return next(new AppError('Session has expired. Please log in again.', 401, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid authentication token', 401, 'INVALID_TOKEN'));
  }

  // 3. Fast-path: Check persistent user session in Redis
  try {
    const cachedSession = await CacheService.getUserSession(decoded.id);

    if (cachedSession) {
      if (!cachedSession.isActive) {
        return next(new AppError('User account is deactivated', 403, 'ACCOUNT_DEACTIVATED'));
      }
      req.user = {
        id: cachedSession.id,
        email: cachedSession.email,
        name: cachedSession.name,
        role: cachedSession.role,
      };
      return next();
    }

    // 4. Fallback: Query PostgreSQL if cache missed (e.g. server restart / cold start)
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (dbUser) {
      if (!dbUser.isActive) {
        return next(new AppError('User account is deactivated', 403, 'ACCOUNT_DEACTIVATED'));
      }

      // Re-warm Redis cache so subsequent requests are served fast
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
    }

    return next(new AppError('User account not found', 401, 'USER_NOT_FOUND'));
  } catch (dbError) {
    console.warn(
      '⚠️ DB/cache connection error during session check (deployment restart fallback):',
      dbError
    );
    // JWT cryptographic signature was verified. During deploy restart / DB reconnection,
    // trust the validly signed token claims to avoid logging out users.
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || 'User',
      role: decoded.role as UserRole,
    };
    return next();
  }
};

/**
 * RBAC Role Authorization Guard Middleware
 * Restricts endpoint access strictly to specified UserRoles.
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access restricted: requires role ${roles.join(' or ')}`,
          403,
          'FORBIDDEN_ROLE'
        )
      );
    }

    next();
  };
};

export { authenticateToken } from './authenticateToken.middleware.js';
