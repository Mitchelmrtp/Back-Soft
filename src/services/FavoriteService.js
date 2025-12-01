// 🔄 Favorite Service - Business Logic Layer
// Following Service Pattern and Single Responsibility Principle

import FavoriteRepository from '../repositories/FavoriteRepository.js';
import ResourceService from './ResourceService.js';
import FavoriteValidator from '../validators/FavoriteValidator.js';

class FavoriteService {
  constructor(favoriteRepository = FavoriteRepository, resourceService = ResourceService) {
    this.favoriteRepository = favoriteRepository;
    this.resourceService = resourceService;
  }

  // 🌟 Add resource to favorites
  async addToFavorites(resourceId, userId) {
    try {
      // Validate input data
      const validatedResourceId = FavoriteValidator.validateResourceId(resourceId);
      const validatedUserId = FavoriteValidator.validateUserId(userId);

      // Check if resource exists and user has access
      const resource = await this.resourceService.getResourceById(validatedResourceId, validatedUserId);
      
      if (!resource) {
        throw new Error('Resource not found or access denied');
      }

      // Check if already favorited
      const isAlreadyFavorited = await this.favoriteRepository.isFavorited(validatedUserId, validatedResourceId);
      
      if (isAlreadyFavorited) {
        // If already favorited, remove it (toggle behavior)
        await this.favoriteRepository.removeFavorite(validatedUserId, validatedResourceId);
        return { action: 'removed', isFavorited: false };
      }

      // Add to favorites - handle race condition
      try {
        const favorite = await this.favoriteRepository.addFavorite(validatedUserId, validatedResourceId);
        return { action: 'added', isFavorited: true, favorite };
      } catch (addError) {
        // If it fails because already exists due to race condition, remove it instead
        if (addError.message.includes('already in favorites')) {
          await this.favoriteRepository.removeFavorite(validatedUserId, validatedResourceId);
          return { action: 'removed', isFavorited: false };
        }
        throw addError;
      }
    } catch (error) {
      throw new Error(`Failed to add to favorites: ${error.message}`);
    }
  }

  // 🗑️ Remove resource from favorites
  async removeFromFavorites(resourceId, userId) {
    try {
      // Validate input data
      const validatedResourceId = FavoriteValidator.validateResourceId(resourceId);
      const validatedUserId = FavoriteValidator.validateUserId(userId);

      // Check if favorited
      const isFavorited = await this.favoriteRepository.isFavorited(validatedUserId, validatedResourceId);
      
      if (!isFavorited) {
        throw new Error('Resource is not in favorites');
      }

      // Remove from favorites
      const removed = await this.favoriteRepository.removeFavorite(validatedUserId, validatedResourceId);
      
      if (!removed) {
        throw new Error('Failed to remove from favorites');
      }

      return { success: true, message: 'Resource removed from favorites' };
    } catch (error) {
      throw new Error(`Failed to remove from favorites: ${error.message}`);
    }
  }

  // 🔄 Toggle favorite status
  async toggleFavorite(resourceId, userId) {
    try {
      // Validate input data
      const validatedResourceId = FavoriteValidator.validateResourceId(resourceId);
      const validatedUserId = FavoriteValidator.validateUserId(userId);

      // Check current status
      const isFavorited = await this.favoriteRepository.isFavorited(validatedUserId, validatedResourceId);
      
      if (isFavorited) {
        // Remove from favorites
        await this.removeFromFavorites(validatedResourceId, validatedUserId);
        return { 
          action: 'removed', 
          isFavorited: false, 
          message: 'Resource removed from favorites' 
        };
      } else {
        // Add to favorites
        const favorite = await this.addToFavorites(validatedResourceId, validatedUserId);
        return { 
          action: 'added', 
          isFavorited: true, 
          favorite,
          message: 'Resource added to favorites' 
        };
      }
    } catch (error) {
      throw new Error(`Failed to toggle favorite: ${error.message}`);
    }
  }

  // 📋 Get user favorites with filters
  async getUserFavorites(userId, filters = {}) {
    try {
      // Validate input data
      const validatedUserId = FavoriteValidator.validateUserId(userId);
      const validatedFilters = FavoriteValidator.validateFavoriteFilters(filters);

      // Get favorites from repository
      const result = await this.favoriteRepository.getUserFavorites(validatedUserId, validatedFilters);
      
      // Transform data for frontend
      const transformedFavorites = result.favorites.map(favorite => ({
        id: favorite.id,
        created_at: favorite.created_at,
        resource: {
          ...favorite.resource.toJSON(),
          isFavorited: true // Since these are all favorites
        }
      }));

      return {
        ...result,
        favorites: transformedFavorites
      };
    } catch (error) {
      throw new Error(`Failed to fetch favorites: ${error.message}`);
    }
  }

  // 🔍 Check if resource is favorited
  async checkFavoriteStatus(resourceId, userId) {
    try {
      // Validate input data
      const validatedResourceId = FavoriteValidator.validateResourceId(resourceId);
      const validatedUserId = FavoriteValidator.validateUserId(userId);

      const isFavorited = await this.favoriteRepository.isFavorited(validatedUserId, validatedResourceId);
      
      return { 
        resourceId: validatedResourceId,
        userId: validatedUserId,
        isFavorited 
      };
    } catch (error) {
      throw new Error(`Failed to check favorite status: ${error.message}`);
    }
  }

  // 📊 Get user favorite statistics
  async getUserFavoriteStats(userId) {
    try {
      // Validate input data
      const validatedUserId = FavoriteValidator.validateUserId(userId);

      const stats = await this.favoriteRepository.getUserFavoriteStats(validatedUserId);
      
      return {
        userId: validatedUserId,
        ...stats
      };
    } catch (error) {
      throw new Error(`Failed to fetch favorite statistics: ${error.message}`);
    }
  }

  // 🗑️ Clear all user favorites
  async clearAllFavorites(userId) {
    try {
      // Validate input data
      const validatedUserId = FavoriteValidator.validateUserId(userId);

      const deletedCount = await this.favoriteRepository.removeAllUserFavorites(validatedUserId);
      
      return {
        userId: validatedUserId,
        deletedCount,
        message: `${deletedCount} favorites removed successfully`
      };
    } catch (error) {
      throw new Error(`Failed to clear favorites: ${error.message}`);
    }
  }

  // 📊 Get most favorited resources (public endpoint)
  async getMostFavoritedResources(limit = 10) {
    try {
      const results = await this.favoriteRepository.getMostFavoritedResources(limit);
      
      return results.map(item => ({
        resource: item.resource,
        favoriteCount: parseInt(item.dataValues.favorite_count)
      }));
    } catch (error) {
      throw new Error(`Failed to fetch most favorited resources: ${error.message}`);
    }
  }

  // 📋 Get favorites for multiple resources (batch check)
  async checkMultipleFavoriteStatus(resourceIds, userId) {
    try {
      // Validate input data
      const validatedUserId = FavoriteValidator.validateUserId(userId);
      
      if (!Array.isArray(resourceIds) || resourceIds.length === 0) {
        throw new Error('Resource IDs must be a non-empty array');
      }

      // Validate all resource IDs
      const validatedResourceIds = resourceIds.map(id => 
        FavoriteValidator.validateResourceId(id)
      );

      // Check favorite status for all resources
      const favoriteStatuses = await Promise.all(
        validatedResourceIds.map(async (resourceId) => {
          const isFavorited = await this.favoriteRepository.isFavorited(validatedUserId, resourceId);
          return {
            resourceId,
            isFavorited
          };
        })
      );

      return favoriteStatuses;
    } catch (error) {
      throw new Error(`Failed to check multiple favorite statuses: ${error.message}`);
    }
  }
}

export default new FavoriteService();