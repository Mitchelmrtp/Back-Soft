// 🎮 Favorite Controller - Request/Response Layer
// Following Controller Pattern and Dependency Inversion Principle

import FavoriteService from '../services/FavoriteService.js';

class FavoriteController {
  constructor(favoriteService = FavoriteService) {
    this.favoriteService = favoriteService;
  }

  // 🌟 Add resource to favorites
  addToFavorites = async (req, res) => {
    try {
      const { resourceId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        console.error('❌ userId is missing from req.user');
        return res.error('Usuario no autenticado', 401);
      }

      const result = await this.favoriteService.addToFavorites(resourceId, userId);
      
      const message = result.action === 'added' ? 
        'Resource added to favorites successfully' : 
        'Resource removed from favorites successfully';
      
      res.success(result, message, 200);
    } catch (error) {
      console.error('❌ Add to favorites error:', error);
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('access denied') ? 403 : 400;
      res.error(error.message, statusCode);
    }
  };

  // 🗑️ Remove resource from favorites
  removeFromFavorites = async (req, res) => {
    try {
      const { resourceId } = req.params;
      const userId = req.user.userId;

      const result = await this.favoriteService.removeFromFavorites(resourceId, userId);
      
      res.success(result, 'Resource removed from favorites successfully');
    } catch (error) {
      const statusCode = error.message.includes('not in favorites') ? 404 : 400;
      res.error(error.message, statusCode);
    }
  };

  // 🔄 Toggle favorite status
  toggleFavorite = async (req, res) => {
    try {
      const { resourceId } = req.params;
      const userId = req.user.userId;

      const result = await this.favoriteService.toggleFavorite(resourceId, userId);
      
      const statusCode = result.action === 'added' ? 201 : 200;
      res.success(result, result.message, statusCode);
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('access denied') ? 403 : 400;
      res.error(error.message, statusCode);
    }
  };

  // 📋 Get user favorites
  getUserFavorites = async (req, res) => {
    try {
      const userId = req.user.userId;
      const filters = req.query;

      const favorites = await this.favoriteService.getUserFavorites(userId, filters);
      
      res.success(favorites, 'User favorites fetched successfully');
    } catch (error) {
      res.error(error.message, 400);
    }
  };

  // 🔍 Check favorite status for a resource
  checkFavoriteStatus = async (req, res) => {
    try {
      const { resourceId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        console.error('❌ userId is missing from req.user');
        return res.error('Usuario no autenticado', 401);
      }

      const status = await this.favoriteService.checkFavoriteStatus(resourceId, userId);
      
      res.success(status, 'Favorite status checked successfully');
    } catch (error) {
      console.error('❌ Check favorite status error:', error);
      res.error(error.message, 400);
    }
  };

  // 📊 Get user favorite statistics
  getUserFavoriteStats = async (req, res) => {
    try {
      const userId = req.user.userId;

      const stats = await this.favoriteService.getUserFavoriteStats(userId);
      
      res.success(stats, 'User favorite statistics fetched successfully');
    } catch (error) {
      res.error(error.message, 400);
    }
  };

  // 🗑️ Clear all user favorites
  clearAllFavorites = async (req, res) => {
    try {
      const userId = req.user.userId;

      const result = await this.favoriteService.clearAllFavorites(userId);
      
      res.success(result, 'All favorites cleared successfully');
    } catch (error) {
      res.error(error.message, 400);
    }
  };

  // 📊 Get most favorited resources (public endpoint)
  getMostFavoritedResources = async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const resources = await this.favoriteService.getMostFavoritedResources(limit);
      
      res.success({ resources }, 'Most favorited resources fetched successfully');
    } catch (error) {
      res.error(error.message, 400);
    }
  };

  // 📋 Check favorite status for multiple resources
  checkMultipleFavoriteStatus = async (req, res) => {
    try {
      const { resourceIds } = req.body;
      const userId = req.user.userId;

      if (!resourceIds || !Array.isArray(resourceIds)) {
        return res.error('Resource IDs must be provided as an array', 400);
      }

      const statuses = await this.favoriteService.checkMultipleFavoriteStatus(resourceIds, userId);
      
      res.success({ statuses }, 'Multiple favorite statuses checked successfully');
    } catch (error) {
      res.error(error.message, 400);
    }
  };

  // 📊 Get favorite statistics for admin
  getGlobalFavoriteStats = async (req, res) => {
    try {
      // This would require admin permissions - implement admin check middleware
      const userRole = req.user.role;
      
      if (userRole !== 'admin') {
        return res.error('Access denied: Admin privileges required', 403);
      }

      // Implement global stats logic here if needed
      const stats = {
        message: 'Global favorite statistics endpoint - implement as needed',
        totalFavorites: 0,
        mostFavoritedResources: await this.favoriteService.getMostFavoritedResources(5)
      };
      
      res.success(stats, 'Global favorite statistics fetched successfully');
    } catch (error) {
      res.error(error.message, 400);
    }
  };
}

export default new FavoriteController();