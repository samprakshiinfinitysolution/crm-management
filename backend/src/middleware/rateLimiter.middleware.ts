import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

/**
 * Standardized rate limit violation responder matching CRM API Contract (Rule 19)
 */
const createRateLimitHandler = (message: string) => {
  return (_req: Request, res: Response): void => {
    res.status(429).json({
      success: false,
      message,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        details: {
          retryAfter: res.getHeader('Retry-After') || 'Please wait a few moments before trying again.',
        },
      },
    });
  };
};

/**
 * 1. Global General API Limiter
 * Applied across all /api routes to prevent abuse while allowing
 * legitimate real-time dashboard polling and typical user navigation.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 600, // 600 requests per IP per 15 min window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createRateLimitHandler('Too many requests. Please slow down and try again shortly.'),
  skip: (req) => {
    // Whitelist health check probes and socket.io handshakes from rate limiting
    return (
      req.path === '/health' ||
      req.path === '/api/health' ||
      req.path === '/api/health/ready' ||
      req.path.startsWith('/socket.io')
    );
  },
});

/**
 * 2. Sensitive Authentication Limiter
 * Applied to /api/auth/login, /api/auth/register, and /api/auth/change-password
 * to prevent brute-force password guessing and credential stuffing.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Max 10 attempts per IP per 15 min
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createRateLimitHandler('Too many authentication attempts. Please wait 15 minutes before trying again.'),
});

/**
 * 3. Bulk Lead Import / Sheet Ingestion Limiter
 * Applied to /api/imports/upload, /preview, and /commit
 * to prevent server CPU and memory exhaustion from high-volume Excel parsing.
 */
export const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Max 20 sheet upload / commit actions per 15 min
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createRateLimitHandler('Import rate limit reached. Please wait a few minutes before uploading more sheets.'),
});

/**
 * 4. Lead Distribution & Reassignment Transaction Limiter
 * Applied to /api/leads/distribute, /assign, /reassign, and /recall
 * to protect database transaction concurrency and audit log pipeline.
 */
export const distributionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 40, // Max 40 distribution transactions per 15 min
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createRateLimitHandler('Distribution rate limit reached. Please wait before executing further bulk assignments.'),
});

/**
 * 5. Report & Lead Export Limiter
 * Applied to /api/exports/leads and /api/exports/reports
 * to prevent server memory saturation and database load from concurrent heavy Excel jobs.
 */
export const exportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30, // Max 30 exports per IP per 15 min
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createRateLimitHandler('Export rate limit reached. Please wait a few moments before exporting more files.'),
});
