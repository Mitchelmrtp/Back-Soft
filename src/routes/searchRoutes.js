import { Router } from 'express';
import {
    searchResources,
    getSearchSuggestions,
    getPopularSearches,
    advancedSearch
} from '../controllers/searchController.js';
import authMiddleware, { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Apply optional authentication
router.use(optionalAuth);

// Search routes
router.get('/', searchResources);
router.get('/resources', searchResources); // Alias for frontend compatibility
router.get('/suggestions', getSearchSuggestions);
router.get('/popular', getPopularSearches);
router.post('/advanced', advancedSearch);

export default router;