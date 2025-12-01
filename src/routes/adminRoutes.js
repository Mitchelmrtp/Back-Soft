import { Router } from 'express';
import {
    getDashboardStats,
    getUsers,
    updateUser,
    getResourcesForModeration,
    moderateResource,
    getReports,
    requireAdmin
} from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.use(requireAdmin);

router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard', getDashboardStats);

router.get('/users', getUsers);
router.patch('/users/:id', updateUser);

router.get('/resources/moderation', getResourcesForModeration);
router.patch('/resources/:id/moderate', moderateResource);
router.post('/moderate/:id', moderateResource);

router.get('/reports', getReports);

export default router;