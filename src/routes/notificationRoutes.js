import { Router } from 'express';
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '../controllers/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// All notification routes require authentication
router.use(authMiddleware);

// Notification routes
router.get('/', getNotifications);
router.patch('/:id/read', markNotificationAsRead);
router.post('/mark-all-read', markAllNotificationsAsRead);

export default router;