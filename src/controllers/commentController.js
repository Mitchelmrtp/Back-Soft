// 🎮 Comment Controller - Request/Response handling for Comments
// Following Controller Pattern and SOLID principles

import CommentService from '../services/CommentService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * CommentController - Handles HTTP requests for comment operations
 * Follows Single Responsibility and Dependency Injection principles
 */
class CommentController {
  constructor() {
    this.commentService = new CommentService();
  }

  /**
   * Create a new comment
   * POST /api/resources/:resourceId/comments
   */
  createComment = asyncHandler(async (req, res) => {
    const { resourceId } = req.params;
    const userId = req.user.id;
    const { content, parent_id, rating } = req.body;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    // Validate rating if provided
    if (rating !== undefined) {
      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be a number between 1 and 5'
        });
      }
    }

    const commentData = {
      content: content.trim(),
      resource_id: resourceId,
      parent_id: parent_id || null,
      rating: rating ? parseInt(rating) : null
    };

    const result = await this.commentService.createComment(commentData, userId);
    
    res.status(201).json(result);
  });

  /**
   * Get comments for a resource
   * GET /api/resources/:id/comments
   * GET /api/comments/resource/:resourceId
   */
  getResourceComments = asyncHandler(async (req, res) => {
    const { id: resourceIdFromId, resourceId: resourceIdFromParam } = req.params;
    const resourceId = resourceIdFromId || resourceIdFromParam;
    
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: 'Resource ID is required'
      });
    }
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      includeReplies = true
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      includeReplies: includeReplies === 'true'
    };

    const result = await this.commentService.getResourceComments(resourceId, options);
    
    res.json(result);
  });

  /**
   * Get user's comments
   * GET /api/comments/my-comments
   */
  getUserComments = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await this.commentService.getUserComments(userId, options);
    
    res.json(result);
  });

  /**
   * Get a specific comment
   * GET /api/comments/:commentId
   */
  getComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const result = await this.commentService.getComment(commentId);
    
    res.json(result);
  });

  /**
   * Update a comment
   * PUT /api/comments/:commentId
   */
  updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const updateData = {
      content: content.trim()
    };

    const result = await this.commentService.updateComment(commentId, updateData, userId);
    
    res.json(result);
  });

  /**
   * Delete a comment
   * DELETE /api/comments/:commentId
   */
  deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const result = await this.commentService.deleteComment(commentId, userId, isAdmin);
    
    res.json(result);
  });

  /**
   * Delete a comment from resource (alternative endpoint)
   * DELETE /api/resources/:resourceId/comments/:commentId
   */
  deleteResourceComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const result = await this.commentService.deleteComment(commentId, userId, isAdmin);
    
    res.json(result);
  });

  /**
   * Get comment statistics for a resource
   * GET /api/resources/:id/comments/stats
   * GET /api/comments/resource/:resourceId/stats
   */
  getCommentStats = asyncHandler(async (req, res) => {
    const { id: resourceIdFromId, resourceId: resourceIdFromParam } = req.params;
    const resourceId = resourceIdFromId || resourceIdFromParam;
    
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: 'Resource ID is required'
      });
    }

    const result = await this.commentService.getCommentStats(resourceId);
    
    res.json(result);
  });

  /**
   * Moderate a comment (admin only)
   * PATCH /api/admin/comments/:commentId/moderate
   */
  moderateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { action } = req.body;
    const moderatorId = req.user.id;

    // Validate action
    const validActions = ['approve', 'hide', 'delete', 'flag'];
    if (!action || !validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid moderation action. Valid actions: ' + validActions.join(', ')
      });
    }

    const result = await this.commentService.moderateComment(commentId, action, moderatorId);
    
    res.json(result);
  });

  /**
   * Get moderation queue (admin only)
   * GET /api/admin/comments/moderation-queue
   */
  getModerationQueue = asyncHandler(async (req, res) => {
    const {
      limit = 20,
      status = 'published',
      includeReported = false
    } = req.query;

    const options = {
      limit: parseInt(limit),
      status,
      includeReported: includeReported === 'true'
    };

    const result = await this.commentService.getModerationQueue(options);
    
    res.json(result);
  });

  /**
   * Create a reply to a comment
   * POST /api/comments/:commentId/reply
   */
  createReply = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }

    // First get the parent comment to get the resource_id
    const parentComment = await this.commentService.getComment(commentId);
    
    if (!parentComment.success) {
      return res.status(404).json({
        success: false,
        message: 'Parent comment not found'
      });
    }

    const commentData = {
      content: content.trim(),
      resource_id: parentComment.data.resource_id,
      parent_id: commentId
    };

    const result = await this.commentService.createComment(commentData, userId);
    
    res.status(201).json(result);
  });

  /**
   * Get replies for a comment
   * GET /api/comments/:commentId/replies
   */
  getCommentReplies = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Get the comment with its replies
    const result = await this.commentService.getComment(commentId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    // Extract just the replies
    const replies = result.data.replies || [];
    
    // Apply pagination to replies
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedReplies = replies.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedReplies,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: replies.length,
        totalPages: Math.ceil(replies.length / limitNum),
        hasMore: endIndex < replies.length
      }
    });
  });

  /**
   * Create or update a rating (comment with rating)
   * POST/PUT /api/resources/:resourceId/rating
   */
  createOrUpdateRating = asyncHandler(async (req, res) => {
    const { id: resourceId } = req.params;
    const userId = req.user.id;
    const { rating, content } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars'
      });
    }

    const ratingData = {
      content: content ? content.trim() : `Rated ${rating} star${rating > 1 ? 's' : ''}`,
      resource_id: resourceId,
      rating: parseInt(rating),
      parent_id: null // Ratings are always top-level comments
    };

    const result = await this.commentService.createOrUpdateRating(ratingData, userId);
    
    res.status(result.isUpdate ? 200 : 201).json(result);
  });

  /**
   * Get rating statistics for a resource
   * GET /api/resources/:resourceId/rating-stats
   */
  getResourceRatingStats = asyncHandler(async (req, res) => {
    const { id: resourceId } = req.params;

    const stats = await this.commentService.getResourceRatingStats(resourceId);
    
    res.json({
      success: true,
      data: stats
    });
  });

  /**
   * Get user's rating for a resource
   * GET /api/resources/:id/my-rating
   */
  getUserRating = asyncHandler(async (req, res) => {
    const { id: resourceId } = req.params;
    const userId = req.user?.id || req.user?.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const userRating = await this.commentService.getUserRating(resourceId, userId);
    
    res.json({
      success: true,
      data: userRating
    });
  });

  /**
   * Delete user's rating for a resource
   * DELETE /api/resources/:id/my-rating
   */
  deleteUserRating = asyncHandler(async (req, res) => {
    const { id: resourceId } = req.params;
    const userId = req.user.id;

    await this.commentService.deleteUserRating(resourceId, userId);
    
    res.json({
      success: true,
      message: 'Rating deleted successfully'
    });
  });
}

// Export controller methods for use in routes
const commentController = new CommentController();

export const {
  createComment,
  getResourceComments,
  getUserComments,
  getComment,
  updateComment,
  deleteComment,
  deleteResourceComment,
  getCommentStats,
  moderateComment,
  getModerationQueue,
  createReply,
  getCommentReplies,
  createOrUpdateRating,
  getResourceRatingStats,
  getUserRating,
  deleteUserRating
} = commentController;

export default commentController;