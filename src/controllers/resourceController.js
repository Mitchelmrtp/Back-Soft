import ResourceService from '../services/ResourceService.js';
import { processUploadedFiles } from '../services/uploadService.js';
import path from 'path';
import fs from 'fs';

class ResourceController {
  constructor(resourceService = ResourceService) {
    this.resourceService = resourceService;
  }

  getResources = async (req, res) => {
    try {
      const userId = req.user?.userId || null;
      console.log('🎮 ResourceController.getResources - userId:', userId);
      console.log('🎮 ResourceController.getResources - query:', req.query);
      
      const result = await this.resourceService.getResources(req.query, userId);
      
      console.log('🎮 ResourceController.getResources - result sample:', {
        totalResources: result.resources?.length || 0,
        firstResourceInteractionData: result.resources?.[0] ? {
          id: result.resources[0].id,
          title: result.resources[0].title,
          isFavorited: result.resources[0].isFavorited,
          isLiked: result.resources[0].isLiked
        } : 'no resources'
      });
      
      res.success(result, 'Resources fetched successfully');
    } catch (error) {
      res.error(error.message, 400);
    }
  };

  // 🔍 Get resource by ID
  getResourceById = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || null;
      
      console.log('🔍 ResourceController.getResourceById - params:', { id, userId });
      
      const resource = await this.resourceService.getResourceById(id, userId);
      
      console.log('🔍 ResourceController.getResourceById - result:', {
        resourceId: resource.id,
        title: resource.title,
        isFavorited: resource.isFavorited,
        isLiked: resource.isLiked
      });
      
      res.success({ resource }, 'Resource fetched successfully');
    } catch (error) {
      console.log('🔍 ResourceController.getResourceById - error:', error.message);
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Access denied') ? 403 : 400;
      res.error(error.message, statusCode);
    }
  };

  createResource = async (req, res) => {
    try {
      const userId = req.user.userId;
      const resource = await this.resourceService.createResource(req.body, userId);
      
      res.success({ resource }, 'Resource created successfully', 201);
    } catch (error) {
      res.error(error.message, 400);
    }
  };

  updateResource = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      const resource = await this.resourceService.updateResource(id, req.body, userId);
      
      res.success({ resource }, 'Resource updated successfully');
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('Access denied') ? 403 : 400;
      res.error(error.message, statusCode);
    }
  };

  deleteResource = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      await this.resourceService.deleteResource(id, userId);
      
      res.success(null, 'Resource deleted successfully');
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('Access denied') ? 403 : 400;
      res.error(error.message, statusCode);
    }
  };

  // 👤 Get user's resources
  getUserResources = async (req, res) => {
    try {
      const userId = req.user.userId;
      const result = await this.resourceService.getUserResources(userId, req.query);
      
      res.success(result, 'User resources fetched successfully');
    } catch (error) {
      res.error(error.message, 400);
    }
  };

  // 🏷️ Get resources by category
  getResourcesByCategory = async (req, res) => {
    try {
      const { categoryId } = req.params;
      const result = await this.resourceService.getResourcesByCategory(categoryId, req.query);
      
      res.success(result, 'Category resources fetched successfully');
    } catch (error) {
      res.error(error.message, 400);
    }
  };

  // 📤 Upload resource with file
  uploadResource = async (req, res) => {
    try {
      const userId = req.user.userId;
      
      if (!req.file) {
        return res.error('No file uploaded', 400);
      }

      const file = {
        name: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path,
        filename: req.file.filename
      };
      
      const metadata = req.body;
      
      const resource = await this.resourceService.uploadResourceWithFile(file, metadata, userId);
      
      res.success({ resource }, 'Resource uploaded successfully', 201);
    } catch (error) {
      console.error('Upload error:', error);
      res.error(error.message, 400);
    }
  };

  // 🔄 Update resource status (admin/moderation)
  updateResourceStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.userId;
      const userRole = req.user.role;
      
      const resource = await this.resourceService.updateResourceStatus(id, status, userId, userRole);
      
      res.success({ resource }, 'Resource status updated successfully');
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('Access denied') ? 403 : 400;
      res.error(error.message, statusCode);
    }
  };

  // 📊 Get resource statistics
  getResourceStats = async (req, res) => {
    try {
      const userId = req.user?.userId || null;
      const stats = await this.resourceService.getResourceStats(userId);
      
      res.success({ stats }, 'Resource statistics fetched successfully');
    } catch (error) {
      res.error(error.message, 400);
    }
  };

  // 🔍 Search resources
  searchResources = async (req, res) => {
    try {
      const { q: searchQuery } = req.query;
      
      if (!searchQuery) {
        return res.error('Search query is required', 400);
      }

      const result = await this.resourceService.searchResources(searchQuery, req.query);
      
      res.success(result, 'Search completed successfully');
    } catch (error) {
      res.error(error.message, 400);
    }
  };

  // 👁️ Increment resource views (public endpoint)
  incrementViews = async (req, res) => {
    try {
      const { id } = req.params;
      
      const resource = await this.resourceService.getResourceById(id);
      
      res.success({ resource }, 'View count updated');
    } catch (error) {
      res.error(error.message, 400);
    }
  };

  // 📥 Download resource file
  downloadResource = async (req, res) => {
    try {
      const { id } = req.params;
      const resource = await this.resourceService.getResourceById(id);
      
      if (!resource.file_path) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Increment download count
      await this.resourceService.incrementDownloads(id);

      // Resolve file path
      let filePath = resource.file_path;
      if (!path.isAbsolute(filePath)) {
        filePath = path.resolve(filePath);
      }
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found on server'
        });
      }

      // Get file extension for proper naming
      const ext = path.extname(filePath);
      const filename = `${resource.title}${ext}`;

      // Set headers for download
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      // Send file
      res.sendFile(filePath);
    } catch (error) {
      console.error('❌ Download error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  };
}

// Export controller instance
const resourceController = new ResourceController();

// Export individual methods for route binding
export const {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getUserResources,
  getResourcesByCategory,
  uploadResource,
  updateResourceStatus,
  getResourceStats,
  searchResources,
  incrementViews,
  downloadResource
} = resourceController;