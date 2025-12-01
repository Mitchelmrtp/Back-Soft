import { Router } from 'express';
import { 
    register, 
    login, 
    getProfile, 
    logout, 
    refreshToken, 
    forgotPassword, 
    resetPassword 
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import optionalAuthMiddleware from '../middleware/optionalAuthMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', optionalAuthMiddleware, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.use(authMiddleware);
router.get('/me', getProfile);

export default router;