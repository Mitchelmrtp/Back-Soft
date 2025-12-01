// 🔧 Like Service - Business Logic for Resource Likes
// Following Service Pattern and Single Responsibility Principle

import LikeRepository from '../repositories/LikeRepository.js';
import ResourceRepository from '../repositories/ResourceRepository.js';
import UserRepository from '../repositories/UserRepository.js';

class LikeService {
  constructor() {
    this.likeRepository = LikeRepository;
    this.resourceRepository = ResourceRepository;
    this.userRepository = UserRepository;
  }

  // 👍 Add like to resource
  async addLike(resourceId, userId) {
    try {
      // Validate resource exists using repository
      const resource = await this.resourceRepository.findById(resourceId);
      if (!resource) {
        throw new Error('Resource not found');
      }

      // Check if already liked using repository
      const existingLike = await this.likeRepository.findByUserAndResource(userId, resourceId);

      if (existingLike) {
        // If already liked, remove it (toggle behavior)
        await this.likeRepository.delete({ resource_id: resourceId, user_id: userId });
        await this.resourceRepository.decrementField(resourceId, 'likes_count');
        return { action: 'removed', isLiked: false };
      }

      // Create like using repository
      const like = await this.likeRepository.create({
        resource_id: resourceId,
        user_id: userId
      });

      // Increment likes_count using repository
      await this.resourceRepository.incrementField(resourceId, 'likes_count');

      return {
        action: 'added',
        isLiked: true,
        like: {
          id: like.id,
          resource_id: like.resource_id,
          user_id: like.user_id,
          created_at: like.created_at
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // 👎 Remove like from resource
  async removeLike(resourceId, userId) {
    try {
      const like = await this.likeRepository.findByUserAndResource(userId, resourceId);

      if (!like) {
        throw new Error('Resource not liked by user');
      }

      await this.likeRepository.delete(like.id);

      // Decrement likes_count using repository
      await this.resourceRepository.decrementField(resourceId, 'likes_count');

      return { 
        message: 'Like removed successfully',
        resource_id: resourceId,
        user_id: userId 
      };
    } catch (error) {
      throw error;
    }
  }

  // 🔄 Toggle like status
  async toggleLike(resourceId, userId) {
    try {
      // Check if already liked using repository
      const existingLike = await this.likeRepository.findByUserAndResource(userId, resourceId);

      if (existingLike) {
        // Remove like
        await this.removeLike(resourceId, userId);
        return {
          action: 'removed',
          isLiked: false,
          resource_id: resourceId,
          user_id: userId,
          message: 'Like removed successfully'
        };
      } else {
        // Add like
        const like = await this.addLike(resourceId, userId);
        return {
          action: 'added',
          isLiked: true,
          like,
          message: 'Like added successfully'
        };
      }
    } catch (error) {
      throw error;
    }
  }

  // 🔍 Check if user liked a specific resource
  async checkLikeStatus(resourceId, userId) {
    try {
      const like = await this.likeRepository.findByUserAndResource(userId, resourceId);

      return {
        isLiked: !!like,
        resource_id: resourceId,
        user_id: userId,
        liked_at: like?.created_at || null
      };
    } catch (error) {
      throw error;
    }
  }

  // 📊 Get total likes for a resource
  async getResourceLikeCount(resourceId) {
    try {
      // Get resource using repository
      const resource = await this.resourceRepository.findById(resourceId, false);
      if (!resource) {
        throw new Error('Resource not found');
      }

      // Get actual count from likes repository for verification
      const actualCount = await this.likeRepository.countByResource(resourceId);

      // Use the count from Resource model (likes_count field)
      return {
        resource_id: resourceId,
        like_count: resource.likes_count || 0,
        actual_count: actualCount // For debugging/verification
      };
    } catch (error) {
      throw error;
    }
  }

  // 📋 Get user's liked resources
  async getUserLikedResources(userId, filters = {}) {
    try {
      const page = parseInt(filters.page) || 1;
      const limit = Math.min(parseInt(filters.limit) || 10, 100);

      const result = await this.likeRepository.findByUser(userId, {
        page,
        limit,
        includeResource: true
      });

      return {
        likes: result.likes.map(like => ({
          id: like.id,
          resource_id: like.resource_id,
          liked_at: like.created_at,
          resource: like.resource
        })),
        pagination: result.pagination
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new LikeService();