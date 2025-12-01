import { Router } from 'express';
import {
    getFAQ,
    submitContactForm,
    getHelpArticles,
    getHelpArticle,
    reportProblem,
    getSystemStatus
} from '../controllers/helpController.js';
import authMiddleware, { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes (no authentication required)
router.get('/faq', getFAQ);
router.post('/contact', submitContactForm);
router.get('/articles', getHelpArticles);
router.get('/articles/:id', getHelpArticle);
router.get('/status', getSystemStatus);

// Protected routes (authentication required)
router.use(optionalAuth); // Optional auth for problem reports
router.post('/report', reportProblem);

export default router;