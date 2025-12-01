// 🗄️ Comment Repository - Data Access Layer for Comments
// Following Repository Pattern and Single Responsibility Principle

import { Comment, User, Resource } from '../models/index.js';
import { Op, Sequelize } from 'sequelize';

/**
 * CommentRepository - Handles all database operations for comments
 * Follows Repository Pattern for clean architecture
 */
class CommentRepository {
  /**
   * Create a new comment
   * @param {Object} commentData - Comment data
   * @returns {Promise<Object>} Created comment with user info
   */
  async create(commentData) {
    try {
      const comment = await Comment.create(commentData);
      return this.findById(comment.id);
    } catch (error) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }
  }

  /**
   * Find comment by ID with relationships
   * @param {string} commentId - Comment UUID
   * @returns {Promise<Object|null>} Comment with user and replies
   */
  async findById(commentId) {
    try {
      return await Comment.findOne({
        where: { id: commentId, status: { [Op.ne]: 'deleted' } },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'avatar_url', 'role']
          },
          {
            model: Comment,
            as: 'replies',
            where: { status: { [Op.ne]: 'deleted' } },
            required: false,
            include: [{
              model: User,
              as: 'author',
              attributes: ['id', 'name', 'avatar_url', 'role']
            }],
            order: [['created_at', 'ASC']]
          }
        ],
        order: [['replies', 'created_at', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Failed to find comment: ${error.message}`);
    }
  }

  /**
   * Get comments for a resource with pagination
   * @param {string} resourceId - Resource UUID
   * @param {Object} options - Pagination and filtering options
   * @returns {Promise<Object>} Paginated comments
   */
  async findByResource(resourceId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        includeReplies = true
      } = options;

      const offset = (page - 1) * limit;

      const whereClause = {
        resource_id: resourceId,
        parent_id: null, // Only top-level comments
        status: { [Op.ne]: 'deleted' }
      };

      const includeOptions = [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar_url', 'role']
        }
      ];

      if (includeReplies) {
        includeOptions.push({
          model: Comment,
          as: 'replies',
          where: { status: { [Op.ne]: 'deleted' } },
          required: false,
          include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'avatar_url', 'role']
          }],
          order: [['created_at', 'ASC']]
        });
      }

      const { count, rows } = await Comment.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        distinct: true
      });

      return {
        comments: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
          hasMore: page * limit < count
        }
      };
    } catch (error) {
      throw new Error(`Failed to find resource comments: ${error.message}`);
    }
  }

  /**
   * Get comments by user
   * @param {string} userId - User UUID
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} User's comments with resources
   */
  async findByUser(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      const { count, rows } = await Comment.findAndCountAll({
        where: { 
          user_id: userId,
          status: { [Op.ne]: 'deleted' }
        },
        include: [
          {
            model: Resource,
            as: 'resource',
            attributes: ['id', 'title', 'type']
          }
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return {
        comments: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to find user comments: ${error.message}`);
    }
  }

  /**
   * Update comment
   * @param {string} commentId - Comment UUID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated comment
   */
  async update(commentId, updateData) {
    try {
      const [updatedCount] = await Comment.update(updateData, {
        where: { id: commentId }
      });

      if (updatedCount === 0) {
        throw new Error('Comment not found or no changes made');
      }

      return this.findById(commentId);
    } catch (error) {
      throw new Error(`Failed to update comment: ${error.message}`);
    }
  }

  /**
   * Soft delete comment
   * @param {string} commentId - Comment UUID
   * @returns {Promise<boolean>} Success status
   */
  async delete(commentId) {
    try {
      const result = await Comment.update(
        { status: 'deleted' },
        { where: { id: commentId } }
      );

      return result[0] > 0;
    } catch (error) {
      throw new Error(`Failed to delete comment: ${error.message}`);
    }
  }

  /**
   * Get comment statistics for a resource
   * @param {string} resourceId - Resource UUID
   * @returns {Promise<Object>} Comment statistics
   */
  async getResourceStats(resourceId) {
    try {
      const totalComments = await Comment.count({
        where: {
          resource_id: resourceId,
          status: { [Op.ne]: 'deleted' }
        }
      });

      const topLevelComments = await Comment.count({
        where: {
          resource_id: resourceId,
          parent_id: null,
          status: { [Op.ne]: 'deleted' }
        }
      });

      const replies = totalComments - topLevelComments;

      return {
        total: totalComments,
        topLevel: topLevelComments,
        replies
      };
    } catch (error) {
      throw new Error(`Failed to get comment stats: ${error.message}`);
    }
  }

  /**
   * Check if user can comment on resource
   * @param {string} userId - User UUID
   * @param {string} resourceId - Resource UUID
   * @returns {Promise<boolean>} Can comment status
   */
  async canUserComment(userId, resourceId) {
    try {
      // Check if resource exists and is accessible
      const resource = await Resource.findOne({
        where: { 
          id: resourceId,
          status: 'published',
          visibility: { [Op.in]: ['public', 'restricted'] }
        }
      });

      return !!resource;
    } catch (error) {
      throw new Error(`Failed to check comment permission: ${error.message}`);
    }
  }

  /**
   * Get recent comments for moderation
   * @param {Object} options - Filtering options
   * @returns {Promise<Object>} Recent comments for review
   */
  async getRecentForModeration(options = {}) {
    try {
      const { 
        limit = 20, 
        status = 'published',
        includeReported = false 
      } = options;

      const whereClause = { status };
      
      if (includeReported) {
        whereClause[Op.or] = [
          { status: 'published' },
          { status: 'flagged' }
        ];
      }

      const comments = await Comment.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'email', 'role']
          },
          {
            model: Resource,
            as: 'resource',
            attributes: ['id', 'title', 'type']
          }
        ],
        limit,
        order: [['created_at', 'DESC']]
      });

      return comments;
    } catch (error) {
      throw new Error(`Failed to get comments for moderation: ${error.message}`);
    }
  }

  /**
   * Get rating statistics for a resource
   * @param {string} resourceId - Resource UUID
   * @returns {Promise<Object>} Rating statistics
   */
  async getResourceRatingStats(resourceId) {
    try {
      const stats = await Comment.findAll({
        where: { 
          resource_id: resourceId,
          parent_id: null, // Only top-level comments can have ratings
          rating: { [Op.ne]: null },
          status: 'published'
        },
        attributes: [
          [Sequelize.fn('AVG', Sequelize.col('rating')), 'averageRating'],
          [Sequelize.fn('COUNT', Sequelize.col('rating')), 'totalRatings'],
          [Sequelize.literal("SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END)"), 'rating1'],
          [Sequelize.literal("SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END)"), 'rating2'],
          [Sequelize.literal("SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END)"), 'rating3'],
          [Sequelize.literal("SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END)"), 'rating4'],
          [Sequelize.literal("SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END)"), 'rating5']
        ],
        raw: true
      });

      const result = stats[0];
      return {
        averageRating: parseFloat(result.averageRating) || 0,
        totalRatings: parseInt(result.totalRatings) || 0,
        distribution: [
          { rating: 1, count: parseInt(result.rating1) || 0 },
          { rating: 2, count: parseInt(result.rating2) || 0 },
          { rating: 3, count: parseInt(result.rating3) || 0 },
          { rating: 4, count: parseInt(result.rating4) || 0 },
          { rating: 5, count: parseInt(result.rating5) || 0 }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get resource rating stats: ${error.message}`);
    }
  }

  /**
   * Check if user has already rated a resource
   * @param {string} resourceId - Resource UUID
   * @param {string} userId - User UUID
   * @returns {Promise<Object|null>} Existing rating comment or null
   */
  async findUserRating(resourceId, userId) {
    try {
      return await Comment.findOne({
        where: { 
          resource_id: resourceId,
          user_id: userId,
          parent_id: null,
          rating: { [Op.ne]: null },
          status: 'published'
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'avatar_url', 'role']
          }
        ]
      });
    } catch (error) {
      throw new Error(`Failed to find user rating: ${error.message}`);
    }
  }
}

export default CommentRepository;