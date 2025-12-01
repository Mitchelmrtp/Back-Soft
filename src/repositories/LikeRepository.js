// 🏥️ Repository Pattern - Data Access Layer for Resource Likes
// Following Repository Pattern and Single Responsibility Principle

import { ResourceLike, User, Resource } from '../models/index.js';
import { Op } from 'sequelize';

class LikeRepository {
  // Create new like
  async create(likeData) {
    try {
      return await ResourceLike.create(likeData);
    } catch (error) {
      throw new Error(`Error creating like: ${error.message}`);
    }
  }

  // Find like by ID with associations
  async findById(id, includeAssociations = true) {
    try {
      const includeOptions = includeAssociations ? [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatar_url']
        },
        {
          model: Resource,
          as: 'resource',
          attributes: ['id', 'title', 'type', 'description']
        }
      ] : [];

      return await ResourceLike.findByPk(id, {
        include: includeOptions
      });
    } catch (error) {
      throw new Error(`Error finding like by ID: ${error.message}`);
    }
  }

  // Find like by user and resource
  async findByUserAndResource(userId, resourceId) {
    try {
      return await ResourceLike.findOne({
        where: {
          user_id: userId,
          resource_id: resourceId
        }
      });
    } catch (error) {
      throw new Error(`Error finding like by user and resource: ${error.message}`);
    }
  }

  // Delete like
  async delete(id) {
    try {
      const deletedCount = await ResourceLike.destroy({
        where: { id }
      });
      
      if (deletedCount === 0) {
        throw new Error('Like not found');
      }
      
      return { deleted: true };
    } catch (error) {
      throw new Error(`Error deleting like: ${error.message}`);
    }
  }

  // Delete like by user and resource
  async deleteByUserAndResource(userId, resourceId) {
    try {
      const deletedCount = await ResourceLike.destroy({
        where: {
          user_id: userId,
          resource_id: resourceId
        }
      });
      
      if (deletedCount === 0) {
        throw new Error('Like not found');
      }
      
      return { deleted: true };
    } catch (error) {
      throw new Error(`Error deleting like by user and resource: ${error.message}`);
    }
  }

  // Find all likes by resource
  async findByResource(resourceId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        includeUser = true
      } = options;

      const offset = (page - 1) * limit;
      const includeOptions = [];

      if (includeUser) {
        includeOptions.push({
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatar_url']
        });
      }

      const result = await ResourceLike.findAndCountAll({
        where: { resource_id: resourceId },
        include: includeOptions,
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return {
        likes: result.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(result.count / limit),
          totalItems: result.count,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`Error finding likes by resource: ${error.message}`);
    }
  }

  // Find all likes by user
  async findByUser(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        includeResource = true
      } = options;

      const offset = (page - 1) * limit;
      const includeOptions = [];

      if (includeResource) {
        includeOptions.push({
          model: Resource,
          as: 'resource',
          attributes: ['id', 'title', 'type', 'description', 'file_url']
        });
      }

      const result = await ResourceLike.findAndCountAll({
        where: { user_id: userId },
        include: includeOptions,
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return {
        likes: result.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(result.count / limit),
          totalItems: result.count,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`Error finding likes by user: ${error.message}`);
    }
  }

  // Count likes by resource
  async countByResource(resourceId) {
    try {
      return await ResourceLike.count({
        where: { resource_id: resourceId }
      });
    } catch (error) {
      throw new Error(`Error counting likes by resource: ${error.message}`);
    }
  }

  // Count likes by user
  async countByUser(userId) {
    try {
      return await ResourceLike.count({
        where: { user_id: userId }
      });
    } catch (error) {
      throw new Error(`Error counting likes by user: ${error.message}`);
    }
  }

  // Check if user has liked resource
  async hasUserLikedResource(userId, resourceId) {
    try {
      const like = await ResourceLike.findOne({
        where: {
          user_id: userId,
          resource_id: resourceId
        },
        attributes: ['id']
      });
      
      return !!like;
    } catch (error) {
      throw new Error(`Error checking if user liked resource: ${error.message}`);
    }
  }

  // Get like statistics for resource
  async getResourceLikeStats(resourceId) {
    try {
      const totalLikes = await this.countByResource(resourceId);
      
      const recentLikes = await ResourceLike.count({
        where: {
          resource_id: resourceId,
          created_at: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      });

      return {
        totalLikes,
        recentLikes,
        resourceId
      };
    } catch (error) {
      throw new Error(`Error getting like statistics: ${error.message}`);
    }
  }

  // Get most liked resources
  async getMostLikedResources(limit = 10) {
    try {
      return await ResourceLike.findAll({
        attributes: [
          'resource_id',
          [ResourceLike.sequelize.fn('COUNT', ResourceLike.sequelize.col('resource_id')), 'likeCount']
        ],
        include: [
          {
            model: Resource,
            as: 'resource',
            attributes: ['id', 'title', 'type', 'description']
          }
        ],
        group: ['resource_id', 'resource.id'],
        order: [[ResourceLike.sequelize.fn('COUNT', ResourceLike.sequelize.col('resource_id')), 'DESC']],
        limit
      });
    } catch (error) {
      throw new Error(`Error getting most liked resources: ${error.message}`);
    }
  }

  // Check if resource is liked by user
  async isResourceLikedByUser(resourceId, userId) {
    try {
      const like = await ResourceLike.findOne({
        where: {
          resource_id: resourceId,
          user_id: userId
        }
      });
      return !!like;
    } catch (error) {
      throw new Error(`Error checking if resource is liked: ${error.message}`);
    }
  }

  // Delete like by ID
  async delete(id) {
    try {
      const result = await ResourceLike.destroy({
        where: { id }
      });
      return result > 0;
    } catch (error) {
      throw new Error(`Error deleting like: ${error.message}`);
    }
  }

  // Count likes by resource
  async countByResource(resourceId) {
    try {
      return await ResourceLike.count({
        where: { resource_id: resourceId }
      });
    } catch (error) {
      throw new Error(`Error counting likes for resource: ${error.message}`);
    }
  }

  // Find likes by user with pagination
  async findByUser(userId, options = {}) {
    try {
      const { page = 1, limit = 10, includeResource = false } = options;
      const offset = (page - 1) * limit;

      const includeOptions = includeResource ? [
        {
          model: Resource,
          as: 'resource',
          required: true,
          attributes: ['id', 'title', 'type', 'description', 'created_at']
        }
      ] : [];

      const { count, rows } = await ResourceLike.findAndCountAll({
        where: { user_id: userId },
        include: includeOptions,
        order: [['created_at', 'DESC']],
        limit,
        offset,
        distinct: true
      });

      return {
        likes: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error finding likes by user: ${error.message}`);
    }
  }
}

export default new LikeRepository();