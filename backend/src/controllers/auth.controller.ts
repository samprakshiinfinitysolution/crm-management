import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/auth.service.js';
import { ApiResponse, AuthRequest, UserRole } from '../types/index.js';
import { config } from '../config/env.js';
import { CacheService } from '../services/cache.service.js';
import AuditService from '../services/audit.service.js';
import {
  clearAuthCookieOptions,
  getAuthCookieOptions,
  getRefreshCookieOptions,
  clearRefreshCookieOptions,
} from '../config/authCookie.js';
import {
  generateTokenPair,
  hashToken,
  REFRESH_TOKEN_TTL_MS,
} from '../utils/token.helper.js';
import { RefreshTokenService } from '../services/refreshToken.service.js';
import { AppError } from '../middleware/errorHandler.js';

const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user, token } = await AuthService.register(req.body);

    await AuditService.log({
      action: 'CREATE',
      entityType: 'User',
      entityId: user.id,
      actorUserId: user.id,
      ipAddress: req.ip || req.socket?.remoteAddress,
      newValue: { name: user.name, email: user.email, role: user.role },
    });

    res.cookie(config.tokenKey, token, getAuthCookieOptions());

    const response: ApiResponse = {
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user } = await AuthService.login(req.body);

    // 1. Generate Access Token (15m) & Refresh Token (7d) with family tracking
    const { accessToken, refreshToken, family } = generateTokenPair({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    });

    // 2. Persist hashed refresh token to PostgreSQL
    const tokenHash = hashToken(refreshToken);
    await RefreshTokenService.saveRefreshToken({
      userId: user.id,
      tokenHash,
      family,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    await AuditService.log({
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      actorUserId: user.id,
      ipAddress: req.ip || req.socket?.remoteAddress,
      newValue: { email: user.email, role: user.role },
    });

    // 3. Set Refresh Token in secure HTTP-Only cookie
    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
    res.cookie(config.tokenKey, refreshToken, getRefreshCookieOptions());
    if (config.tokenKey !== 'CRM_Management') {
      res.cookie('CRM_Management', refreshToken, getRefreshCookieOptions());
    }

    const response: ApiResponse = {
      success: true,
      message: 'User logged in successfully',
      data: {
        user,
        accessToken,
        token: accessToken, // backwards compatibility
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies) {
      token = req.cookies.refreshToken || req.cookies[config.tokenKey];
    }

    // Revoke Refresh Token in PostgreSQL if presented
    if (token) {
      try {
        const tokenHash = hashToken(token);
        await RefreshTokenService.revokeToken(tokenHash, 'USER_LOGOUT');
      } catch {
        // Token might not exist in refresh_tokens table (e.g. was access token)
      }
    }

    let userId: string | undefined = (req as AuthRequest).user?.id;
    if (!userId && token) {
      try {
        const decoded = jwt.decode(token) as { id?: string } | null;
        userId = decoded?.id;
      } catch {
        // Malformed token
      }
    }

    if (userId) {
      await CacheService.invalidateUserSession(userId);
      await AuditService.log({
        action: 'LOGOUT',
        entityType: 'User',
        entityId: userId,
        actorUserId: userId,
        ipAddress: req.ip || req.socket?.remoteAddress,
      });
    }

    if (token) {
      let ttlSeconds = config.jwt.refreshTokenTtlMs;
      try {
        const decoded = jwt.decode(token) as { exp?: number } | null;
        if (decoded?.exp) {
          const remaining = decoded.exp - Math.floor(Date.now() / 1000);
          if (remaining > 0) ttlSeconds = remaining;
        }
      } catch {
        // Keep default TTL
      }
      await CacheService.blacklistToken(token, ttlSeconds);
    }

    // Clear HTTP-Only cookies
    res.clearCookie(config.tokenKey, clearAuthCookieOptions());
    if (req.cookies?.refreshToken && config.tokenKey !== 'refreshToken') {
      res.clearCookie('refreshToken', clearRefreshCookieOptions());
    }

    const response: ApiResponse = {
      success: true,
      message: 'User logged out successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const refresh_token = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const presentedToken =
      req.cookies?.refreshToken ||
      req.cookies?.[config.tokenKey] ||
      req.body?.refreshToken;

    if (!presentedToken) {
      throw new AppError('Refresh token required', 401, 'REFRESH_TOKEN_REQUIRED');
    }

    // Rotate token with exploit & reuse detection
    const { accessToken, newRefreshToken, user } = await RefreshTokenService.rotateToken({
      presentedToken,
      ipAddress: req.ip || req.socket?.remoteAddress,
    });

    // Update HTTP-Only cookies with newly rotated refresh token
    res.cookie('refreshToken', newRefreshToken, getRefreshCookieOptions());
    res.cookie(config.tokenKey, newRefreshToken, getRefreshCookieOptions());
    if (config.tokenKey !== 'CRM_Management') {
      res.cookie('CRM_Management', newRefreshToken, getRefreshCookieOptions());
    }

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        token: accessToken, // backwards compatibility
        user,
      },
    });
  } catch (error) {
    // On error, clear refresh cookies to stop loops
    res.clearCookie('refreshToken', clearRefreshCookieOptions());
    res.clearCookie(config.tokenKey, clearAuthCookieOptions());
    next(error);
  }
};

const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = await AuthService.changePassword(userId, req.body);

    await AuditService.log({
      action: 'PASSWORD_CHANGE',
      entityType: 'User',
      entityId: userId,
      actorUserId: userId,
      ipAddress: req.ip || req.socket?.remoteAddress,
    });

    const response: ApiResponse = {
      success: true,
      message: result.message,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const me = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required', error: { code: 'UNAUTHORIZED' } });
      return;
    }
    const user = await AuthService.getAuthenticatedUser(req.user.id);
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies) {
      token =
        req.cookies[config.tokenKey] ||
        req.cookies['CRM_Management'] ||
        req.cookies['token'];
    }
    res.status(200).json({
      success: true,
      message: 'Authenticated user retrieved',
      data: { ...user, ...(token ? { token } : {}) },
    });
  } catch (error) {
    next(error);
  }
};

export { register, login, refresh_token, logout, changePassword, me };
