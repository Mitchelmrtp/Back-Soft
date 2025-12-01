// 🗃️ Favorite Repository - Data Access Layer
// Following Repository Pattern and Interface Segregation Principle

import Favorite from '../models/Favorite.js';
import Resource from '../models/Resource.js';
import User from '../models/User.js';

class FavoriteRepository {
  // 📝 Add a resource to favorites
  async addFavorite(userId, resourceId) {
    try {
      const favorite = await Favorite.create({
        user_id: userId,
        resource_id: resourceId
      });
      
      return await this.findById(favorite.id);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Resource is already in favorites');
      }
      throw error;
    }
  }

  // 🗑️ Remove a resource from favorites
  async removeFavorite(userId, resourceId) {
    try {
      const deleted = await Favorite.destroy({
        where: {
          user_id: userId,
          resource_id: resourceId
        }
      });
      
      return deleted > 0;
    } catch (error) {
      throw error;
    }
  }

  // 📋 Get all favorites for a user
  async getUserFavorites(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        category_id,
        type,
        format
      } = options;

      const offset = (page - 1) * limit;
      
      // Build where clause for resource filtering
      const resourceWhere = {};
      if (category_id) resourceWhere.category_id = category_id;
      if (type) resourceWhere.type = type;
      if (format) resourceWhere.format = format;
      
      // Add visibility and status filters
      resourceWhere.status = 'published';
      resourceWhere.visibility = ['public', 'restricted']; // User can see public and restricted

      const { count, rows } = await Favorite.findAndCountAll({
        where: { user_id: userId },
        include: [
          {
            model: Resource,
            as: 'resource',
            where: resourceWhere,
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'name', 'avatar_url', 'role']
              }
            ]
          }
        ],
        order: [[{ model: Resource, as: 'resource' }, sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: offset,
        distinct: true
      });

      return {
        favorites: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        hasNextPage: page < Math.ceil(count / limit),
        hasPreviousPage: page > 1
      };
    } catch (error) {
      throw error;
    }
  }

  // 🔍 Check if resource is favorited by user
  async isFavorited(userId, resourceId) {
    try {
      const favorite = await Favorite.findOne({
        where: {
          user_id: userId,
          resource_id: resourceId
        }
      });
      
      return !!favorite;
    } catch (error) {
      throw error;
    }
  }

  // 📊 Get favorite statistics for a user
  async getUserFavoriteStats(userId) {
    try {
      const total = await Favorite.count({
        where: { user_id: userId }
      });

      // Count by resource type
      const byType = await Favorite.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Resource,
            as: 'resource',
            attributes: ['type']
          }
        ],
        group: ['resource.type'],
        attributes: [
          [Resource.sequelize.col('resource.type'), 'type'],
          [Resource.sequelize.fn('COUNT', Resource.sequelize.col('Favorite.id')), 'count']
        ],
        raw: true
      });

      return {
        total,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = parseInt(item.count);
          return acc;
        }, {})
      };
    } catch (error) {
      throw error;
    }
  }

  // 📖 Find favorite by ID with associations
  async findById(id) {
    try {
      return await Favorite.findByPk(id, {
        include: [
          {
            model: Resource,
            as: 'resource',
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'name', 'avatar_url', 'role']
              }
            ]
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'avatar_url']
          }
        ]
      });
    } catch (error) {
      throw error;
    }
  }

  // 🗑️ Remove all favorites for a user
  async removeAllUserFavorites(userId) {
    try {
      const deleted = await Favorite.destroy({
        where: { user_id: userId }
      });
      
      return deleted;
    } catch (error) {
      throw error;
    }
  }

  // 📊 Get most favorited resources
  async getMostFavoritedResources(limit = 10) {
    try {
      const results = await Favorite.findAll({
        include: [
          {
            model: Resource,
            as: 'resource',
            where: {
              status: 'published',
              visibility: ['public', 'restricted']
            },
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'name', 'avatar_url', 'role']
              }
            ]
          }
        ],
        group: ['resource.id', 'resource->author.id'],
        attributes: [
          [Resource.sequelize.fn('COUNT', Resource.sequelize.col('Favorite.id')), 'favorite_count']
        ],
        order: [[Resource.sequelize.fn('COUNT', Resource.sequelize.col('Favorite.id')), 'DESC']],
        limit: parseInt(limit),
        subQuery: false
      });

      return results;
    } catch (error) {
      throw error;
    }
  }
}

export default new FavoriteRepository();