import { Router, Request, Response } from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import userRouter from './user.routes.js';
import importRouter from './import.routes.js';
import leadRouter from './leads.routes.js';
import followUpRouter from './followUp.routes.js';
import reportRouter from './report.routes.js';
import notificationRouter from './notification.routes.js';
import auditLogRouter from './auditLog.routes.js';
import exportRouter from './export.routes.js';
import docsRouter from './docs.routes.js';
import { UserRole } from '../types/index.js';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';
import { config } from '../config/env.js';
import conversationRouter from './conversation.routes.js';
import { refresh_token } from '../controllers/auth.controller.js';
import { verifyOrigin } from '../middleware/csrf.middleware.js';

const apiRouter = Router();

// Interactive API Documentation (Swagger / OpenAPI 3.0)
//
// Gated by config.docs.enabled (see config/env.ts): OFF by default in
// production so the API contract and its embedded auth helpers are never served
// unauthenticated. Opt in with ENABLE_API_DOCS=true.
if (config.docs.enabled) {
  apiRouter.use('/docs', docsRouter);
} else {
  apiRouter.use('/docs', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'API documentation is disabled in this environment.',
      error: { code: 'NOT_FOUND' },
    });
  });
}

// Health Check
apiRouter.use('/health', healthRouter);

// Root API Welcome / Status
apiRouter.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to CRM Lead Management & Sales Distribution REST API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      leads: '/api/leads',
      distribution: '/api/leads/distribute',
      followups: '/api/followups',
      imports: '/api/imports',
      reports: '/api/reports',
      exports: '/api/exports',
      notifications: '/api/notifications',
      audit: '/api/audit-logs',
      conversations: '/api/conversations',
    },
  });
});

// Auth & User routes
apiRouter.use('/auth', authRouter);
apiRouter.post('/refresh', verifyOrigin, refresh_token);

apiRouter.use(authenticateUser);
apiRouter.use(requireRole(UserRole.ADMIN, UserRole.TEAM_LEADER, UserRole.SALES_EXECUTIVE));

apiRouter.use('/users', userRouter);  
apiRouter.use('/leads', leadRouter);
apiRouter.use('/followups', followUpRouter);
apiRouter.use('/imports', importRouter);
apiRouter.use("/exports", exportRouter);

apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/reports', reportRouter);
apiRouter.use('/audit-logs', auditLogRouter);

// message routes
apiRouter.use('/conversations', conversationRouter);

export default apiRouter;
