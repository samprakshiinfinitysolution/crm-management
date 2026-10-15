process.env.NODE_ENV = 'test';

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { closeRedis } from '../src/config/redis.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  hashToken,
  verifyRefreshToken,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from '../src/utils/token.helper.js';
import { authenticateToken } from '../src/middleware/authenticateToken.middleware.js';
import { UserRole } from '../src/types/index.js';
import { AppError } from '../src/middleware/errorHandler.js';
import { config } from '../src/config/env.js';

describe('Access Token & Refresh Token Security Suite', () => {
  const mockUser = {
    id: 'user-uuid-1234',
    email: 'alex.supervisor@leadflow.io',
    name: 'Alex Supervisor',
    role: UserRole.TEAM_LEADER,
  };

  describe('1. Token Generation & Expiration Helpers', () => {
    test('generateAccessToken signs 15-minute token with valid user claims', () => {
      const token = generateAccessToken(mockUser);
      assert.ok(typeof token === 'string' && token.length > 20);

      const decoded = jwt.decode(token) as Record<string, unknown>;
      assert.equal(decoded.id, mockUser.id);
      assert.equal(decoded.email, mockUser.email);
      assert.equal(decoded.role, mockUser.role);
      assert.equal(decoded.name, mockUser.name);

      // Verify expiration matches ACCESS_TOKEN_EXPIRY from config
      const iat = decoded.iat as number;
      const exp = decoded.exp as number;
      const expiryStr = String(ACCESS_TOKEN_EXPIRY);
      const expectedSeconds = expiryStr.endsWith('m')
        ? parseInt(expiryStr, 10) * 60
        : expiryStr.endsWith('h')
        ? parseInt(expiryStr, 10) * 3600
        : expiryStr.endsWith('d')
        ? parseInt(expiryStr, 10) * 86400
        : parseInt(expiryStr, 10) || 900;
      assert.ok(
        exp - iat >= expectedSeconds - 10 && exp - iat <= expectedSeconds + 10,
        `AccessToken must have configured TTL (${expectedSeconds}s)`
      );
    });

    test('generateRefreshToken signs 7-day token bound to family and jti', () => {
      const family = 'family-group-999';
      const token = generateRefreshToken(mockUser.id, family);
      assert.ok(typeof token === 'string');

      const verified = verifyRefreshToken(token);
      assert.equal(verified.id, mockUser.id);
      assert.equal(verified.family, family);
      assert.ok(verified.jti, 'Must generate unique cryptographic jti');

      const decoded = jwt.decode(token) as Record<string, unknown>;
      const iat = decoded.iat as number;
      const exp = decoded.exp as number;
      assert.ok(exp - iat >= 7 * 86400 - 10, 'RefreshToken must have 7-day TTL');
    });

    test('generateTokenPair returns synchronized access token, refresh token, and family', () => {
      const pair = generateTokenPair(mockUser);
      assert.ok(pair.accessToken);
      assert.ok(pair.refreshToken);
      assert.ok(pair.family);

      const refreshClaims = verifyRefreshToken(pair.refreshToken);
      assert.equal(refreshClaims.family, pair.family);
      assert.equal(refreshClaims.id, mockUser.id);
    });

    test('hashToken produces deterministic SHA-256 hash', () => {
      const rawToken = 'sample_refresh_token_string_abc';
      const hash1 = hashToken(rawToken);
      const hash2 = hashToken(rawToken);

      assert.equal(hash1, hash2);
      assert.equal(hash1.length, 64, 'SHA-256 hex string must be 64 characters');
      assert.notEqual(hash1, rawToken, 'Hash must not equal plaintext token');
    });
  });

  describe('2. authenticateToken Express Middleware', () => {
    test('rejects request when Authorization header is missing', async () => {
      const req = { headers: {} } as any;
      let nextError: unknown;

      await authenticateToken(req, {} as any, (err?: unknown) => {
        nextError = err;
      });

      assert.ok(nextError instanceof AppError);
      assert.equal((nextError as AppError).statusCode, 401);
      assert.equal((nextError as AppError).errorCode, 'UNAUTHORIZED');
    });

    test('rejects request with malformed Authorization format', async () => {
      const req = { headers: { authorization: 'Basic somebase64' } } as any;
      let nextError: unknown;

      await authenticateToken(req, {} as any, (err?: unknown) => {
        nextError = err;
      });

      assert.ok(nextError instanceof AppError);
      assert.equal((nextError as AppError).statusCode, 401);
    });

    test('rejects expired access token with TOKEN_EXPIRED', async () => {
      // Create expired token
      const expiredToken = jwt.sign(mockUser, config.jwt.secret, { expiresIn: '0s' });
      // Wait 10ms so it is strictly expired
      await new Promise((r) => setTimeout(r, 20));

      const req = { headers: { authorization: `Bearer ${expiredToken}` } } as any;
      let nextError: unknown;

      await authenticateToken(req, {} as any, (err?: unknown) => {
        nextError = err;
      });

      assert.ok(nextError instanceof AppError);
      assert.equal((nextError as AppError).statusCode, 401);
      assert.equal((nextError as AppError).errorCode, 'TOKEN_EXPIRED');
    });

    test('accepts valid access token and attaches req.user', async () => {
      // Stub session in CacheService for deterministic unit test
      const { CacheService } = await import('../src/services/cache.service.js');
      const originalGetUserSession = CacheService.getUserSession;
      CacheService.getUserSession = async (id: string) => {
        if (id === mockUser.id) {
          return {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            role: mockUser.role,
            isActive: true,
          };
        }
        return null;
      };

      try {
        const validToken = generateAccessToken(mockUser);
        const req = { headers: { authorization: `Bearer ${validToken}` } } as any;
        let nextCalled = false;

        await authenticateToken(req, {} as any, (err?: unknown) => {
          if (!err) nextCalled = true;
        });

        assert.equal(nextCalled, true, 'Middleware must pass valid token to next()');
        assert.ok(req.user);
        assert.equal(req.user.id, mockUser.id);
        assert.equal(req.user.email, mockUser.email);
        assert.equal(req.user.role, mockUser.role);
      } finally {
        CacheService.getUserSession = originalGetUserSession;
      }
    });
  });

  after(async () => {
    await closeRedis();
  });
});

