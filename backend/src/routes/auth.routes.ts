import { Router } from 'express';
import { register, login, refresh_token, logout, changePassword, me } from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { verifyOrigin } from '../middleware/csrf.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const apiRouter = Router();

apiRouter.post('/register', authLimiter, register);
apiRouter.post('/login', authLimiter, login);
apiRouter.post('/refresh', verifyOrigin, refresh_token);
apiRouter.post('/refresh-token', verifyOrigin, refresh_token);
apiRouter.post('/logout', verifyOrigin, logout);
apiRouter.get('/me', authenticateUser, me);
apiRouter.post('/change-password', verifyOrigin, authenticateUser, authLimiter, changePassword);

export default apiRouter;
