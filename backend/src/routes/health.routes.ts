import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types/index.js';
import { prisma } from '../config/db.js';
import { isRedisAvailable } from '../config/redis.js';

const router = Router();

// Liveness probe: cheap, dependency-free. Use for uptime/keep-alive checks.
router.get('/', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'CRM API Server is healthy and running',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'crm-backend',
      version: '1.0.0',
    },
  };
  res.status(200).json(response);
});

// Readiness probe: verifies downstream dependencies (Postgres + Redis) before
// the load balancer routes traffic to this instance. Returns 503 when a
// required dependency is unavailable so the LB can pull the instance from
// rotation during rolling deploys or transient outages.
router.get('/ready', async (_req: Request, res: Response) => {
  const checks: Record<string, 'ok' | 'unavailable'> = {
    database: 'unavailable',
    redis: 'unavailable',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'unavailable';
  }

  checks.redis = isRedisAvailable() ? 'ok' : 'unavailable';

  // Redis powers sessions/cache and the Socket.IO adapter. Treat the database
  // as strictly required; Redis is reported but not fatal (DB fallback exists).
  const ready = checks.database === 'ok';

  const response: ApiResponse = {
    success: ready,
    message: ready
      ? 'CRM API is ready to serve traffic'
      : 'CRM API is not ready (required dependency unavailable)',
    data: {
      ready,
      checks,
      timestamp: new Date().toISOString(),
    },
  };

  res.status(ready ? 200 : 503).json(response);
});

export default router;
