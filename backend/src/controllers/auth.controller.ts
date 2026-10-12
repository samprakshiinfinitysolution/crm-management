import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/auth.service.js';
import { ApiResponse, AuthRequest } from '../types/index.js';
import { config } from '../config/env.js';
import { CacheService } from '../services/cache.service.js';
import AuditService from '../services/audit.service.js';
import { clearAuthCookieOptions, getAuthCookieOptions } from '../config/authCookie.js';

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
    const { user, token } = await AuthService.login(req.body);

    await AuditService.log({
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      actorUserId: user.id,
      ipAddress: req.ip || req.socket?.remoteAddress,
      newValue: { email: user.email, role: user.role },
    });

    res.cookie(config.tokenKey, token, getAuthCookieOptions());

    const response: ApiResponse = {
      success: true,
      message: 'User logged in successfully',
      data: {
        user,
        token,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Extract the presented token from the Authorization header or auth cookie.
    //    Logout must work even for an expired/invalid token so a stale session can
    //    always be cleared, so we read the raw token rather than relying on the
    //    auth middleware having populated req.user.
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies) {
      token = req.cookies[config.tokenKey];
    }

    // 2. Identify the user for session invalidation + auditing. Prefer the
    //    authenticated identity when present, otherwise decode the token claims
    //    (signature is irrelevant here — we only need the subject to clean up).
    let userId: string | undefined = (req as AuthRequest).user?.id;
    if (!userId && token) {
      try {
        const decoded = jwt.decode(token) as { id?: string } | null;
        userId = decoded?.id;
      } catch {
        // Malformed token — nothing to invalidate server-side.
      }
    }

    // 3. Invalidate the server-side session and record the audit entry.
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

    // 4. Blacklist the exact token until it would have expired naturally, so an
    //    already-issued (possibly copied) JWT cannot be replayed after logout.
    if (token) {
      let ttlSeconds = 7 * 24 * 3600; // Default: match the 7-day session window.
      try {
        const decoded = jwt.decode(token) as { exp?: number } | null;
        if (decoded?.exp) {
          const remaining = decoded.exp - Math.floor(Date.now() / 1000);
          if (remaining > 0) ttlSeconds = remaining;
        }
      } catch {
        // Ignore decode errors; keep the default TTL.
      }
      await CacheService.blacklistToken(token, ttlSeconds);
    }

    // 5. Clear the auth cookie using the same name/path/domain used to set it.
    res.clearCookie(config.tokenKey, clearAuthCookieOptions());

    const response: ApiResponse = {
      success: true,
      message: 'User logged out successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const refresh_token = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    await CacheService.saveUserSession(user.id, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: true,
    });

    res.cookie(config.tokenKey, token, getAuthCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: { user, token },
    });
  } catch (error) {
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
