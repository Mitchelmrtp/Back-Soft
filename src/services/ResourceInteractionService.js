// 🔧 Resource Interaction Service - Business Logic Layer
// Handles cross-entity operations for resources (likes, favorites, etc.)
// Following Service Layer Pattern and Single Responsibility Principle

import FavoriteRepository from '../repositories/FavoriteRepository.js';
import LikeRepository from '../repositories/LikeRepository.js';

class ResourceInteractionService {
  constructor() {
    this.favoriteRepository = FavoriteRepository;
    this.likeRepository = LikeRepository;
  }

  // Get user-specific interaction data for a resource
  async getUserInteractionData(userId, resourceId) {
    try {
      if (!userId) {
        return {
          isFavorited: false,
          isLiked: false
        };
      }

      // Get favorite status
      const isFavorited = await this.favoriteRepository.isFavorited(userId, resourceId);
      
      // Get like status
      const isLiked = await this.likeRepository.isResourceLikedByUser(resourceId, userId);

      return {
        isFavorited,
        isLiked
      };
    } catch (error) {
      // Don't fail the request if user-specific data fails to load
      console.log('Failed to load user interaction data:', error.message);
      return {
        isFavorited: false,
        isLiked: false
      };
    }
  }

  // Toggle favorite status for a resource
  async toggleFavorite(userId, resourceId) {
    try {
      const isFavorited = await this.favoriteRepository.isFavorited(userId, resourceId);
      
      if (isFavorited) {
        await this.favoriteRepository.removeFavorite(userId, resourceId);
        return { isFavorited: false, action: 'removed' };
      } else {
        await this.favoriteRepository.addFavorite(userId, resourceId);
        return { isFavorited: true, action: 'added' };
      }
    } catch (error) {
      throw new Error(`Failed to toggle favorite: ${error.message}`);
    }
  }

  // Toggle like status for a resource
  async toggleLike(userId, resourceId) {
    try {
      const isLiked = await this.likeRepository.isResourceLikedByUser(resourceId, userId);
      
      if (isLiked) {
        await this.likeRepository.removeLike(resourceId, userId);
        return { isLiked: false, action: 'removed' };
      } else {
        await this.likeRepository.addLike(resourceId, userId);
        return { isLiked: true, action: 'added' };
      }
    } catch (error) {
      throw new Error(`Failed to toggle like: ${error.message}`);
    }
  }

  // Get user favorites with pagination
  async getUserFavorites(userId, options = {}) {
    try {
      return await this.favoriteRepository.getUserFavorites(userId, options);
    } catch (error) {
      throw new Error(`Failed to get user favorites: ${error.message}`);
    }
  }

  // Get user liked resources with pagination
  async getUserLikedResources(userId, options = {}) {
    try {
      return await this.likeRepository.getUserLikedResources(userId, options);
    } catch (error) {
      throw new Error(`Failed to get user liked resources: ${error.message}`);
    }
  }
}

export default new ResourceInteractionService();