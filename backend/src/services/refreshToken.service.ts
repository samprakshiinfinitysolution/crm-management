import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { CacheService } from './cache.service.js';
import AuditService from './audit.service.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
  REFRESH_TOKEN_TTL_MS,
  RefreshTokenPayload,
} from '../utils/token.helper.js';
import { UserRole } from '../types/index.js';

export interface StoredRefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  family: string;
  parent_id: string | null;
  is_revoked: boolean;
  revoked_reason: string | null;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
  user_name: string;
  user_email: string;
  user_role: string;
  user_is_active: boolean;
  user_is_deleted: boolean;
}

export class RefreshTokenService {
  /**
   * Persists a newly issued refresh token in PostgreSQL.
   */
  static async saveRefreshToken(params: {
    userId: string;
    tokenHash: string;
    family: string;
    parentId?: string | null;
    expiresAt: Date;
  }): Promise<void> {
    await prisma.$executeRaw`
      INSERT INTO refresh_tokens (
        id,
        user_id,
        token_hash,
        family,
        parent_id,
        is_revoked,
        expires_at,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid()::text,
        ${params.userId},
        ${params.tokenHash},
        ${params.family},
        ${params.parentId || null},
        false,
        ${params.expiresAt},
        NOW(),
        NOW()
      )
    `;
  }

  /**
   * Finds a refresh token record along with its owning user details.
   */
  static async findTokenByHash(tokenHash: string): Promise<StoredRefreshTokenRow | null> {
    const rows = await prisma.$queryRaw<StoredRefreshTokenRow[]>`
      SELECT 
        rt.id,
        rt.user_id,
        rt.token_hash,
        rt.family,
        rt.parent_id,
        rt.is_revoked,
        rt.revoked_reason,
        rt.expires_at,
        rt.created_at,
        rt.updated_at,
        u.name as user_name,
        u.email as user_email,
        u.role::text as user_role,
        u."isActive" as user_is_active,
        u."isDeleted" as user_is_deleted
      FROM refresh_tokens rt
      JOIN "User" u ON u.id = rt.user_id
      WHERE rt.token_hash = ${tokenHash}
      LIMIT 1
    `;

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Revokes all refresh tokens in a family when reuse/exploit is detected.
   */
  static async revokeFamily(family: string, reason = 'EXPLOIT_DETECTED_REUSE'): Promise<number> {
    const count = await prisma.$executeRaw`
      UPDATE refresh_tokens
      SET is_revoked = true,
          revoked_reason = ${reason},
          updated_at = NOW()
      WHERE family = ${family}
        AND is_revoked = false
    `;
    return count;
  }

  /**
   * Revokes a specific refresh token by its hash.
   */
  static async revokeToken(tokenHash: string, reason = 'USER_LOGOUT'): Promise<void> {
    await prisma.$executeRaw`
      UPDATE refresh_tokens
      SET is_revoked = true,
          revoked_reason = ${reason},
          updated_at = NOW()
      WHERE token_hash = ${tokenHash}
    `;
  }

  /**
   * Revokes all active refresh tokens for a user (e.g., password change or account deactivation).
   */
  static async revokeAllUserTokens(userId: string, reason = 'USER_REVOKED_ALL'): Promise<void> {
    await prisma.$executeRaw`
      UPDATE refresh_tokens
      SET is_revoked = true,
          revoked_reason = ${reason},
          updated_at = NOW()
      WHERE user_id = ${userId}
        AND is_revoked = false
    `;
  }

  /**
   * Core Token Rotation Algorithm with Exploitation / Reuse Detection:
   * 1. Cryptographically verifies incoming refresh token.
   * 2. Checks PostgreSQL record.
   * 3. If token is ALREADY REVOKED => Breached! Revokes the entire token family.
   * 4. If valid, marks old token as ROTATED and atomically inserts the new token.
   * 5. Returns new access token + new refresh token.
   */
  static async rotateToken(params: {
    presentedToken: string;
    ipAddress?: string;
  }): Promise<{
    accessToken: string;
    newRefreshToken: string;
    user: { id: string; email: string; name: string; role: UserRole };
  }> {
    const { presentedToken, ipAddress } = params;

    // 1. Verify cryptographic validity & extract claims
    let decoded: RefreshTokenPayload;
    try {
      decoded = verifyRefreshToken(presentedToken);
    } catch (err: any) {
      if (err?.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expired. Please log in again.', 401, 'REFRESH_TOKEN_EXPIRED');
      }
      throw new AppError('Invalid refresh token. Please log in again.', 401, 'INVALID_REFRESH_TOKEN');
    }

    const tokenHash = hashToken(presentedToken);

    // 2. Lookup the token in the database
    const tokenRecord = await this.findTokenByHash(tokenHash);

    // -------------------------------------------------------------------------
    // CRITICAL SECURITY GATE: Token Reuse / Exploit Detection
    // -------------------------------------------------------------------------
    if (!tokenRecord) {
      // Token is valid JWT but missing in DB => Possible leak/forgery.
      if (decoded.family) {
        await this.revokeFamily(decoded.family, 'UNRECOGNIZED_TOKEN_FAMILY');
      }
      if (decoded.id) {
        await CacheService.invalidateUserSession(decoded.id);
      }
      throw new AppError('Invalid refresh token session. Please log in again.', 401, 'INVALID_REFRESH_TOKEN');
    }

    if (tokenRecord.is_revoked) {
      // REUSE DETECTED: Someone presented an already-rotated or revoked token!
      // This indicates an attacker has intercepted an older token from the chain.
      // Immediate action: Revoke the entire family to lock out the attacker.
      await this.revokeFamily(tokenRecord.family, 'EXPLOIT_DETECTED_REUSE');
      await CacheService.invalidateUserSession(tokenRecord.user_id);

      await AuditService.log({
        action: 'UPDATE',
        entityType: 'Auth',
        entityId: tokenRecord.id,
        actorUserId: tokenRecord.user_id,
        ipAddress,
        newValue: {
          alert: 'Refresh token reuse detected. Revoked entire token family.',
          family: tokenRecord.family,
          revokedTokenId: tokenRecord.id,
        },
      });

      throw new AppError(
        'Suspicious session activity detected. All active sessions have been revoked for your security. Please log in again.',
        403,
        'TOKEN_REUSE_DETECTED'
      );
    }

    // 3. Expiration check
    if (new Date(tokenRecord.expires_at) < new Date()) {
      await this.revokeToken(tokenHash, 'EXPIRED');
      throw new AppError('Refresh token has expired. Please log in again.', 401, 'REFRESH_TOKEN_EXPIRED');
    }

    // 4. Verify user status
    if (!tokenRecord.user_is_active || tokenRecord.user_is_deleted) {
      throw new AppError('User account is deactivated or deleted', 403, 'ACCOUNT_DEACTIVATED');
    }

    const user = {
      id: tokenRecord.user_id,
      email: tokenRecord.user_email,
      name: tokenRecord.user_name,
      role: tokenRecord.user_role as UserRole,
    };

    // 5. Generate fresh tokens keeping the SAME family lineage
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user, tokenRecord.family);
    const newTokenHash = hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    // 6. Atomic rotation in PostgreSQL: revoke old token + insert new child token
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        UPDATE refresh_tokens
        SET is_revoked = true,
            revoked_reason = 'ROTATED',
            updated_at = NOW()
        WHERE id = ${tokenRecord.id}
      `;

      await tx.$executeRaw`
        INSERT INTO refresh_tokens (
          id,
          user_id,
          token_hash,
          family,
          parent_id,
          is_revoked,
          expires_at,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid()::text,
          ${user.id},
          ${newTokenHash},
          ${tokenRecord.family},
          ${tokenRecord.id},
          false,
          ${newExpiresAt},
          NOW(),
          NOW()
        )
      `;
    });

    // 7. Re-warm Redis user session
    await CacheService.saveUserSession(user.id, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: true,
    });

    return {
      accessToken: newAccessToken,
      newRefreshToken,
      user,
    };
  }
}
