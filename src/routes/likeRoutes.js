// 🛣️ Like Routes - API Endpoint Definitions for Resource Likes
// Following RESTful API Design and Single Responsibility Principle

import express from 'express';
import LikeController from '../controllers/LikeController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// First define specific routes that don't require auth
/**
 * @route GET /api/likes/:resourceId/count
 * @desc Get total like count for a resource (PUBLIC)
 * @access Public
 * @param {string} resourceId - UUID of the resource
 */
router.get('/:resourceId/count',
  LikeController.getResourceLikeCount
);

// Define user-specific routes (these need specific paths before general ones)
router.get('/user/liked',
  authMiddleware,
  LikeController.getUserLikedResources
);

// All other like routes require authentication
router.use(authMiddleware);

/**
 * @route PUT /api/likes/:resourceId/toggle
 * @desc Toggle like status for a resource
 * @access Private
 * @param {string} resourceId - UUID of the resource to toggle
 */
router.put('/:resourceId/toggle',
  LikeController.toggleLike
);

/**
 * @route GET /api/likes/:resourceId/status
 * @desc Check if a resource is liked by the user
 * @access Private
 * @param {string} resourceId - UUID of the resource to check
 */
router.get('/:resourceId/status',
  LikeController.checkLikeStatus
);

/**
 * @route POST /api/likes/:resourceId
 * @desc Add a like to a resource
 * @access Private
 * @param {string} resourceId - UUID of the resource to like
 */
router.post('/:resourceId', 
  LikeController.addLike
);

/**
 * @route DELETE /api/likes/:resourceId
 * @desc Remove a like from a resource
 * @access Private
 * @param {string} resourceId - UUID of the resource to unlike
 */
router.delete('/:resourceId',
  LikeController.removeLike
);

export default router;