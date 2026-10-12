import { Router, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { CacheService } from '../services/cache.service.js';

const notificationRouter = Router();

notificationRouter.use(authenticateUser);

notificationRouter.get('/unread-count', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const cacheKey = `crm:notif:unread:${userId}`;
    const unreadCount = await CacheService.getOrSet(
      cacheKey,
      () =>
        prisma.notification.count({
          where: { recipientUserId: userId, isRead: false },
        }),
      5, // 5s TTL
    );

    res.status(200).json({
      success: true,
      message: 'Unread notification count retrieved',
      data: { unreadCount },
    });
  } catch (error) {
    next(error);
  }
});

notificationRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { recipientUserId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          recipientUserId: true,
          title: true,
          message: true,
          type: true,
          isRead: true,
          readAt: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({
        where: { recipientUserId: userId },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

notificationRouter.patch('/:id/read', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, recipientUserId: userId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOT_FOUND');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });

    CacheService.del(`crm:notif:unread:${userId}`).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

notificationRouter.patch('/read-all', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    await prisma.notification.updateMany({
      where: { recipientUserId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    CacheService.del(`crm:notif:unread:${userId}`).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: { success: true },
    });
  } catch (error) {
    next(error);
  }
});

export default notificationRouter;
