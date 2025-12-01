import { Router } from 'express';
import {
    getUserProfile,
    updateUserProfile,
    changePassword,
    getUserSettings,
    updateUserSettings,
    uploadAvatar
} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { upload } from '../services/uploadService.js';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

// Profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.put('/password', changePassword);

// Avatar upload
router.post('/avatar', upload.single('profile_picture'), uploadAvatar);

// Settings routes
router.get('/settings', getUserSettings);
router.put('/settings', updateUserSettings);

export default router;