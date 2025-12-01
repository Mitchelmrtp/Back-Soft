// 🧠 Comment Service - Business Logic Layer for Comments
// Following Service Layer Pattern and SOLID principles

import CommentRepository from '../repositories/CommentRepository.js';
import ErrorProcessingService from './ErrorProcessingService.js';

/**
 * CommentService - Handles business logic for comments
 * Follows Single Responsibility and Dependency Inversion principles
 */
class CommentService {
  constructor() {
    this.commentRepository = new CommentRepository();
  }

  /**
   * Create a new comment
   * @param {Object} commentData - Comment data
   * @param {string} userId - User creating the comment
   * @returns {Promise<Object>} Created comment
   */
  async createComment(commentData, userId) {
    try {
      // Validate permission to comment
      const canComment = await this.commentRepository.canUserComment(
        userId, 
        commentData.resource_id
      );

      if (!canComment) {
        throw new Error('You do not have permission to comment on this resource');
      }

      // Validate parent comment if it's a reply
      if (commentData.parent_id) {
        const parentComment = await this.commentRepository.findById(commentData.parent_id);
        if (!parentComment) {
          throw new Error('Parent comment not found');
        }
        
        if (parentComment.resource_id !== commentData.resource_id) {
          throw new Error('Parent comment does not belong to the same resource');
        }
      }

      // Sanitize and validate content
      const sanitizedData = this.sanitizeCommentData({
        ...commentData,
        user_id: userId,
        status: 'published' // Auto-publish for now, can add moderation later
      });

      const comment = await this.commentRepository.create(sanitizedData);

      return {
        success: true,
        data: comment,
        message: 'Comment created successfully'
      };
    } catch (error) {
      throw ErrorProcessingService.processError(error, 'createComment');
    }
  }

  /**
   * Get comments for a resource
   * @param {string} resourceId - Resource UUID
   * @param {Object} options - Pagination and filtering options
   * @returns {Promise<Object>} Paginated comments
   */
  async getResourceComments(resourceId, options = {}) {
    try {
      const result = await this.commentRepository.findByResource(resourceId, options);
      
      return {
        success: true,
        data: result.comments,
        pagination: result.pagination,
        stats: await this.commentRepository.getResourceStats(resourceId)
      };
    } catch (error) {
      throw ErrorProcessingService.processError(error, 'getResourceComments');
    }
  }

  /**
   * Get user's comments
   * @param {string} userId - User UUID
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} User's comments
   */
  async getUserComments(userId, options = {}) {
    try {
      const result = await this.commentRepository.findByUser(userId, options);
      
      return {
        success: true,
        data: result.comments,
        pagination: result.pagination
      };
    } catch (error) {
      throw ErrorProcessingService.processError(error, 'getUserComments');
    }
  }

  /**
   * Update a comment
   * @param {string} commentId - Comment UUID
   * @param {Object} updateData - Update data
   * @param {string} userId - User requesting the update
   * @returns {Promise<Object>} Updated comment
   */
  async updateComment(commentId, updateData, userId) {
    try {
      const comment = await this.commentRepository.findById(commentId);
      
      if (!comment) {
        throw new Error('Comment not found');
      }

      // Check ownership or admin privileges
      if (comment.user_id !== userId && !this.isAdminUser(userId)) {
        throw new Error('You can only edit your own comments');
      }

      // Sanitize update data
      const sanitizedData = this.sanitizeCommentData(updateData);
      
      // Remove fields that shouldn't be updated by users
      delete sanitizedData.user_id;
      delete sanitizedData.resource_id;
      delete sanitizedData.parent_id;
      
      const updatedComment = await this.commentRepository.update(commentId, sanitizedData);

      return {
        success: true,
        data: updatedComment,
        message: 'Comment updated successfully'
      };
    } catch (error) {
      throw ErrorProcessingService.processError(error, 'updateComment');
    }
  }

  /**
   * Delete a comment
   * @param {string} commentId - Comment UUID
   * @param {string} userId - User requesting deletion
   * @param {boolean} isAdmin - Whether user is admin
   * @returns {Promise<Object>} Deletion result
   */
  async deleteComment(commentId, userId, isAdmin = false) {
    try {
      const comment = await this.commentRepository.findById(commentId);
      
      if (!comment) {
        throw new Error('Comment not found');
      }

      // Check ownership or admin privileges
      if (comment.user_id !== userId && !isAdmin) {
        throw new Error('You can only delete your own comments');
      }

      const deleted = await this.commentRepository.delete(commentId);

      if (!deleted) {
        throw new Error('Failed to delete comment');
      }

      return {
        success: true,
        message: 'Comment deleted successfully'
      };
    } catch (error) {
      throw ErrorProcessingService.processError(error, 'deleteComment');
    }
  }

  /**
   * Get a specific comment
   * @param {string} commentId - Comment UUID
   * @returns {Promise<Object>} Comment data
   */
  async getComment(commentId) {
    try {
      const comment = await this.commentRepository.findById(commentId);
      
      if (!comment) {
        throw new Error('Comment not found');
      }

      return {
        success: true,
        data: comment
      };
    } catch (error) {
      throw ErrorProcessingService.processError(error, 'getComment');
    }
  }

  /**
   * Get comment statistics for a resource
   * @param {string} resourceId - Resource UUID
   * @returns {Promise<Object>} Comment statistics
   */
  async getCommentStats(resourceId) {
    try {
      const stats = await this.commentRepository.getResourceStats(resourceId);
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw ErrorProcessingService.processError(error, 'getCommentStats');
    }
  }

  /**
   * Moderate comments (admin only)
   * @param {string} commentId - Comment UUID
   * @param {string} action - Moderation action
   * @param {string} moderatorId - Moderator user ID
   * @returns {Promise<Object>} Moderation result
   */
  async moderateComment(commentId, action, moderatorId) {
    try {
      const validActions = ['approve', 'hide', 'delete', 'flag'];
      
      if (!validActions.includes(action)) {
        throw new Error('Invalid moderation action');
      }

      const statusMap = {
        approve: 'published',
        hide: 'hidden',
        delete: 'deleted',
        flag: 'pending'
      };

      const comment = await this.commentRepository.findById(commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      if (action === 'delete') {
        await this.commentRepository.delete(commentId);
      } else {
        await this.commentRepository.update(commentId, {
          status: statusMap[action]
        });
      }

      return {
        success: true,
        message: `Comment ${action}d successfully`,
        action,
        moderatorId
      };
    } catch (error) {
      throw ErrorProcessingService.processError(error, 'moderateComment');
    }
  }

  /**
   * Get comments for moderation queue
   * @param {Object} options - Filtering options
   * @returns {Promise<Object>} Comments for moderation
   */
  async getModerationQueue(options = {}) {
    try {
      const comments = await this.commentRepository.getRecentForModeration(options);
      
      return {
        success: true,
        data: comments
      };
    } catch (error) {
      throw ErrorProcessingService.processError(error, 'getModerationQueue');
    }
  }

  // Private helper methods

  /**
   * Sanitize comment data
   * @param {Object} data - Raw comment data
   * @returns {Object} Sanitized data
   * @private
   */
  sanitizeCommentData(data) {
    const sanitized = {};
    const allowedFields = [
      'content', 'resource_id', 'parent_id', 'user_id', 'status', 'rating'
    ];

    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        sanitized[field] = data[field];
      }
    });

    // Trim and validate content
    if (sanitized.content) {
      sanitized.content = sanitized.content.trim();
      
      if (sanitized.content.length === 0) {
        throw new Error('Comment content cannot be empty');
      }
      
      if (sanitized.content.length > 1000) {
        throw new Error('Comment content is too long (max 1000 characters)');
      }
    }

    // Validate rating if provided
    if (sanitized.rating !== undefined && sanitized.rating !== null) {
      const ratingNum = parseInt(sanitized.rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        throw new Error('Rating must be a number between 1 and 5');
      }
      sanitized.rating = ratingNum;
    }

    return sanitized;
  }

  /**
   * Create or update a rating (comment with rating)
   * @param {Object} ratingData - Rating data including rating value
   * @param {string} userId - User creating/updating the rating
   * @returns {Promise<Object>} Created/updated rating comment
   */
  async createOrUpdateRating(ratingData, userId) {
    try {
      // Check if user already has a rating for this resource
      const existingRating = await this.commentRepository.findUserRating(
        ratingData.resource_id, 
        userId
      );

      let result;
      let isUpdate = false;

      if (existingRating) {
        // Update existing rating
        const updatedData = {
          ...ratingData,
          id: existingRating.id
        };
        
        result = await this.updateComment(existingRating.id, updatedData, userId);
        isUpdate = true;
      } else {
        // Create new rating
        const sanitizedData = this.sanitizeCommentData({
          ...ratingData,
          user_id: userId,
          status: 'published'
        });

        result = await this.commentRepository.create(sanitizedData);
      }

      return {
        success: true,
        message: isUpdate ? 'Rating updated successfully' : 'Rating created successfully',
        data: result,
        isUpdate
      };

    } catch (error) {
      const processedError = ErrorProcessingService.processError(error, 'RATING_OPERATION');
      throw processedError;
    }
  }

  /**
   * Get rating statistics for a resource
   * @param {string} resourceId - Resource UUID
   * @returns {Promise<Object>} Rating statistics
   */
  async getResourceRatingStats(resourceId) {
    try {
      const stats = await this.commentRepository.getResourceRatingStats(resourceId);
      
      return {
        averageRating: stats.averageRating,
        totalRatings: stats.totalRatings,
        distribution: stats.distribution,
        qualityScore: this.calculateQualityScore(stats.averageRating, stats.totalRatings)
      };

    } catch (error) {
      const processedError = ErrorProcessingService.processError(error, 'RATING_STATS');
      throw processedError;
    }
  }

  /**
   * Get user's rating for a resource
   * @param {string} resourceId - Resource UUID
   * @param {string} userId - User UUID
   * @returns {Promise<Object|null>} User's rating comment or null
   */
  async getUserRating(resourceId, userId) {
    try {
      const userRating = await this.commentRepository.findUserRating(resourceId, userId);
      
      return userRating ? {
        id: userRating.id,
        rating: userRating.rating,
        content: userRating.content,
        created_at: userRating.created_at,
        updated_at: userRating.updated_at
      } : null;

    } catch (error) {
      const processedError = ErrorProcessingService.processError(error, 'USER_RATING');
      throw processedError;
    }
  }

  /**
   * Delete user's rating for a resource
   * @param {string} resourceId - Resource UUID
   * @param {string} userId - User UUID
   * @returns {Promise<void>}
   */
  async deleteUserRating(resourceId, userId) {
    try {
      const userRating = await this.commentRepository.findUserRating(resourceId, userId);
      
      if (!userRating) {
        throw new Error('Rating not found');
      }

      // Use existing delete method
      await this.deleteComment(userRating.id, userId);

    } catch (error) {
      const processedError = ErrorProcessingService.processError(error, 'DELETE_RATING');
      throw processedError;
    }
  }

  /**
   * Calculate quality score based on rating and number of ratings
   * @param {number} averageRating - Average rating
   * @param {number} totalRatings - Total number of ratings
   * @returns {string} Quality label
   * @private
   */
  calculateQualityScore(averageRating, totalRatings) {
    if (totalRatings < 3) return 'insufficient-data';
    
    if (averageRating >= 4.5) return 'excellent';
    if (averageRating >= 4.0) return 'very-good';
    if (averageRating >= 3.5) return 'good';
    if (averageRating >= 3.0) return 'fair';
    if (averageRating >= 2.0) return 'poor';
    return 'very-poor';
  }

  /**
   * Check if user is admin
   * @param {string} userId - User UUID
   * @returns {boolean} Is admin status
   * @private
   */
  async isAdminUser(userId) {
    // This would typically check user role from database
    // For now, returning false - implement based on your auth system
    return false;
  }
}

export default CommentService;
