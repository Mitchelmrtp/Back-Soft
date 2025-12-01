// 🎮 Like Controller - Request/Response Layer for Resource Likes
// Following Controller Pattern and Single Responsibility Principle

import LikeService from '../services/LikeService.js';

class LikeController {
  constructor(likeService = LikeService) {
    this.likeService = likeService;
  }

  // 👍 Add like to resource
  addLike = async (req, res) => {
    try {
      const { resourceId } = req.params;
      const userId = req.user.userId;

      const result = await this.likeService.addLike(resourceId, userId);
      
      const message = result.action === 'added' ? 
        'Resource liked successfully' : 
        'Resource unliked successfully';
      
      res.success(result, message, 200);
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('access denied') ? 403 : 400;
      res.error(error.message, statusCode);
    }
  };

  // 👎 Remove like from resource
  removeLike = async (req, res) => {
    try {
      const { resourceId } = req.params;
      const userId = req.user.userId;

      const result = await this.likeService.removeLike(resourceId, userId);
      
      res.success(result, 'Like removed successfully');
    } catch (error) {
      const statusCode = error.message.includes('not liked') ? 404 : 400;
      res.error(error.message, statusCode);
    }
  };

  // 🔄 Toggle like status
  toggleLike = async (req, res) => {
    try {
      const { resourceId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        console.error('❌ userId is missing from req.user');
        return res.error('Usuario no autenticado', 401);
      }

      const result = await this.likeService.toggleLike(resourceId, userId);
      
      res.success(result, 'Like toggled successfully');
    } catch (error) {
      console.error('❌ Toggle like error:', error);
      res.error(error.message, 400);
    }
  };

  // 🔍 Check like status for a resource
  checkLikeStatus = async (req, res) => {
    try {
      const { resourceId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        console.error('❌ userId is missing from req.user');
        return res.error('Usuario no autenticado', 401);
      }

      const status = await this.likeService.checkLikeStatus(resourceId, userId);
      
      res.success(status, 'Like status checked successfully');
    } catch (error) {
      console.error('❌ Check like status error:', error);
      res.error(error.message, 400);
    }
  };

  // 📊 Get resource like count
  getResourceLikeCount = async (req, res) => {
    try {
      const { resourceId } = req.params;

      const count = await this.likeService.getResourceLikeCount(resourceId);
      
      res.success(count, 'Resource like count fetched successfully');
    } catch (error) {
      res.error(error.message, 400);
    }
  };

  // 📋 Get user's liked resources
  getUserLikedResources = async (req, res) => {
    try {
      const userId = req.user.userId;
      const filters = req.query;

      const likedResources = await this.likeService.getUserLikedResources(userId, filters);
      
      res.success(likedResources, 'User liked resources fetched successfully');
    } catch (error) {
      res.error(error.message, 400);
    }
  };
}

export default new LikeController();