// 🛣️ Profile Routes - Routes for user profile management
// Following RESTful design and SOLID principles

import express from 'express';
import ProfileController from '../controllers/profileController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { upload } from '../config/upload.js';

const router = express.Router();

// Apply authentication middleware to all profile routes
router.use(authMiddleware);

// GET /profile - Get current user profile
router.get('/', ProfileController.getProfile);

// PUT /profile - Update current user profile
router.put('/', upload.single('avatar'), ProfileController.updateProfile);

// POST /profile/change-password - Change user password
router.post('/change-password', ProfileController.changePassword);

// DELETE /profile/avatar - Delete user avatar
router.delete('/avatar', ProfileController.deleteAvatar);

// POST /profile/avatar - Upload user avatar
router.post('/avatar', upload.single('avatar'), ProfileController.uploadAvatar);

// GET /profile/stats - Get profile statistics
router.get('/stats', ProfileController.getProfileStats);

// GET /profile/activity - Get user activity history
router.get('/activity', ProfileController.getActivity);

// POST /profile/undo - Undo last profile action
router.post('/undo', ProfileController.undoLastAction);

// GET /profile/history - Get command history
router.get('/history', ProfileController.getCommandHistory);

export default router;