// 🛣️ Favorite Routes - API Endpoint Definitions
// Following RESTful API Design and Single Responsibility Principle

import express from 'express';
import FavoriteController from '../controllers/FavoriteController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Define specific static routes first (before applying auth middleware globally)
/**
 * @route GET /api/favorites/public/most-favorited
 * @desc Get most favorited resources (public data)
 * @access Private (could be made public if needed)
 * @query {number} limit - Number of resources to return (default: 10)
 */
router.get('/public/most-favorited',
  authMiddleware,
  FavoriteController.getMostFavoritedResources
);

/**
 * @route GET /api/favorites/admin/global-stats
 * @desc Get global favorite statistics (admin only)
 * @access Private (Admin)
 */
router.get('/admin/global-stats',
  authMiddleware,
  FavoriteController.getGlobalFavoriteStats
);

/**
 * @route GET /api/favorites/stats/user
 * @desc Get user's favorite statistics
 * @access Private
 */
router.get('/stats/user',
  authMiddleware,
  FavoriteController.getUserFavoriteStats
);

/**
 * @route DELETE /api/favorites/clear/all
 * @desc Clear all user favorites
 * @access Private
 */
router.delete('/clear/all',
  authMiddleware,
  FavoriteController.clearAllFavorites
);

/**
 * @route POST /api/favorites/status/batch
 * @desc Check favorite status for multiple resources
 * @access Private
 * @body {string[]} resourceIds - Array of resource UUIDs to check
 */
router.post('/status/batch',
  authMiddleware,
  FavoriteController.checkMultipleFavoriteStatus
);

// All remaining favorite routes require authentication
router.use(authMiddleware);

/**
 * @route PUT /api/favorites/:resourceId/toggle
 * @desc Toggle favorite status for a resource
 * @access Private
 * @param {string} resourceId - UUID of the resource to toggle
 */
router.put('/:resourceId/toggle',
  FavoriteController.toggleFavorite
);

/**
 * @route GET /api/favorites/:resourceId/status
 * @desc Check if a resource is favorited by the user
 * @access Private
 * @param {string} resourceId - UUID of the resource to check
 */
router.get('/:resourceId/status',
  FavoriteController.checkFavoriteStatus
);

/**
 * @route POST /api/favorites/:resourceId
 * @desc Add a resource to user's favorites
 * @access Private
 * @param {string} resourceId - UUID of the resource to favorite
 */
router.post('/:resourceId', 
  FavoriteController.addToFavorites
);

/**
 * @route DELETE /api/favorites/:resourceId
 * @desc Remove a resource from user's favorites
 * @access Private
 * @param {string} resourceId - UUID of the resource to unfavorite
 */
router.delete('/:resourceId',
  FavoriteController.removeFromFavorites
);

/**
 * @route GET /api/favorites
 * @desc Get user's favorites with optional filters
 * @access Private
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 10, max: 100)
 * @query {string} sortBy - Sort field (created_at, title, views_count, downloads_count, rating_average)
 * @query {string} sortOrder - Sort order (ASC, DESC)
 * @query {string} category_id - Filter by category UUID
 * @query {string} type - Filter by resource type
 * @query {string} format - Filter by file format
 */
router.get('/',
  FavoriteController.getUserFavorites
);

export default router;