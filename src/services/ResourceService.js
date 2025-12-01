// 🔧 Resource Service - Business Logic Layer
// Following Service Layer Pattern and Dependency Inversion Principle

import ResourceRepository from '../repositories/ResourceRepository.js';
import ResourceValidator from '../validators/ResourceValidator.js';
import { processUploadedFiles, deleteFile } from './uploadService.js';
import FavoriteRepository from '../repositories/FavoriteRepository.js';
import ResourceLike from '../models/ResourceLike.js';
import Course from '../models/Course.js';
import path from 'path';

class ResourceService {
  constructor(resourceRepository = ResourceRepository) {
    this.resourceRepository = resourceRepository;
    this.favoriteRepository = FavoriteRepository;
  }

  // Create new resource
  async createResource(resourceData, userId) {
    try {
      // Validate input data
      const validatedData = ResourceValidator.validateCreate(resourceData);
      
      // Validate university-specific fields
      if (validatedData.course_id) {
        const course = await Course.findByPk(validatedData.course_id);
        if (!course) {
          throw new Error('Course not found');
        }
      }
      
      // Add user ID as author
      validatedData.user_id = userId;
      
      // Set default timestamps
      validatedData.created_at = new Date();
      validatedData.updated_at = new Date();

      // Create resource
      const resource = await this.resourceRepository.create(validatedData);
      
      // Return with associations - CRITICAL: ensure we have the id
      const fullResource = await this.resourceRepository.findById(resource.id);
      
      return fullResource;
    } catch (error) {
      throw new Error(`Failed to create resource: ${error.message}`);
    }
  }

  // Get resource by ID
  async getResourceById(id, userId = null) {
    try {
      const resource = await this.resourceRepository.findById(id);
      
      if (!resource) {
        throw new Error('Resource not found');
      }

      // Check visibility permissions
      if (resource.visibility === 'private' && resource.user_id !== userId) {
        throw new Error('Access denied: Resource is private');
      }

      // Increment view count (only if not the author)
      if (resource.user_id !== userId) {
        await this.resourceRepository.incrementViews(id);
      }

      // Add user-specific information if authenticated
      let userSpecificData = {};
      if (userId) {
        try {
          // Get favorite status
          const isFavorited = await this.favoriteRepository.isFavorited(userId, id);
          userSpecificData.isFavorited = isFavorited;

          // Get like status
          const existingLike = await ResourceLike.findOne({
            where: { resource_id: id, user_id: userId }
          });
          userSpecificData.isLiked = !!existingLike;
        } catch (error) {
          // Don't fail the request if user-specific data fails to load
          console.warn('Failed to load user-specific data:', error.message);
          userSpecificData.isFavorited = false;
          userSpecificData.isLiked = false;
        }
      }

      // Return resource with user-specific data
      return {
        ...resource.toJSON(),
        ...userSpecificData
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all resources with filters
  async getResources(filters = {}, userId = null) {
    try {
      // Validate filters
      const validatedFilters = ResourceValidator.validateFilters(filters);
      
      // Add visibility filter for non-authors
      if (!userId) {
        validatedFilters.visibility = 'public';
      }

      const result = await this.resourceRepository.findAll(validatedFilters);
      
      // Add user-specific information if authenticated
      if (userId && result.resources) {
        const resourcesWithUserInfo = await Promise.all(
          result.resources.map(async (resource) => {
            try {
              // Get favorite status
              const isFavorited = await this.favoriteRepository.isFavorited(userId, resource.id);
              
              // Get like status
              const existingLike = await ResourceLike.findOne({
                where: { resource_id: resource.id, user_id: userId }
              });
              const isLiked = !!existingLike;
              
              return {
                ...resource.toJSON(),
                isFavorited,
                isLiked
              };
            } catch (error) {
              // Don't fail the entire request if user-specific data fails
              console.warn(`Failed to load user-specific data for resource ${resource.id}:`, error.message);
              return {
                ...resource.toJSON(),
                isFavorited: false,
                isLiked: false
              };
            }
          })
        );
        
        return {
          ...result,
          resources: resourcesWithUserInfo
        };
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to fetch resources: ${error.message}`);
    }
  }

  // Update resource
  async updateResource(id, updateData, userId) {
    try {
      // Check if resource exists and user has permission
      const existingResource = await this.resourceRepository.findById(id, false);
      
      if (!existingResource) {
        throw new Error('Resource not found');
      }

      if (existingResource.user_id !== userId) {
        throw new Error('Access denied: You can only edit your own resources');
      }

      // Validate update data
      const validatedData = ResourceValidator.validateUpdate(updateData);
      
      // Update timestamp
      validatedData.updated_at = new Date();

      // Update resource
      return await this.resourceRepository.update(id, validatedData);
    } catch (error) {
      throw error;
    }
  }

  // Delete resource
  async deleteResource(id, userId) {
    try {
      // Check if resource exists and user has permission
      const existingResource = await this.resourceRepository.findById(id, false);
      
      if (!existingResource) {
        throw new Error('Resource not found');
      }

      if (existingResource.user_id !== userId) {
        throw new Error('Access denied: You can only delete your own resources');
      }

      // Delete associated files if any
      if (existingResource.file_path) {
        await deleteFile(existingResource.file_path);
      }

      if (existingResource.thumbnail_url) {
        await deleteFile(existingResource.thumbnail_url);
      }

      // Delete resource
      await this.resourceRepository.delete(id);
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get user's resources
  async getUserResources(userId, filters = {}) {
    try {
      const validatedFilters = ResourceValidator.validateFilters(filters);
      return await this.resourceRepository.findByUserId(userId, validatedFilters);
    } catch (error) {
      throw new Error(`Failed to fetch user resources: ${error.message}`);
    }
  }

  // Get resources by category
  async getResourcesByCategory(categoryId, filters = {}) {
    try {
      const validatedFilters = ResourceValidator.validateFilters(filters);
      return await this.resourceRepository.findByCategory(categoryId, validatedFilters);
    } catch (error) {
      throw new Error(`Failed to fetch category resources: ${error.message}`);
    }
  }

  // Upload resource with file
  async uploadResourceWithFile(file, metadata, userId) {
    try {
      // Extract format from mimetype or filename
      const format = path.extname(file.name).toLowerCase().replace('.', '') || 
                     file.mimetype.split('/')[1];
      
      // Construir la URL pública del archivo
      // El archivo se guarda en public/uploads pero se sirve desde /uploads
      const relativePath = file.path.replace(/\\/g, '/');
      let publicPath = '';
      
      if (relativePath.includes('public/uploads/')) {
        publicPath = relativePath.split('public/')[1];
      } else if (relativePath.includes('uploads/')) {
        publicPath = relativePath.substring(relativePath.indexOf('uploads/'));
      }
      
      // Asegurar que la URL no tenga doble barra
      const fileUrl = `http://localhost:3001/${publicPath}`.replace(/([^:]\/)\/+/g, '$1');
      
      console.log('File upload info:', {
        originalPath: file.path,
        relativePath,
        publicPath,
        fileUrl,
        format
      });
      
      // Excluir thumbnail_url de los metadatos ya que lo manejamos por separado
      const { thumbnail_url, ...cleanMetadata } = metadata;
      
      // Create resource data with file information
      const resourceData = {
        ...cleanMetadata,
        file_url: fileUrl,
        file_path: file.path,
        file_size: file.size,
        format: format
      };

      // Solo incluir thumbnail_url si existe y es una URL válida
      if (thumbnail_url && thumbnail_url.trim() !== '') {
        resourceData.thumbnail_url = thumbnail_url;
      }

      console.log('Creating resource with data:', {
        ...resourceData,
        file_path: '***hidden***'
      });

      return await this.createResource(resourceData, userId);
    } catch (error) {
      console.error('Upload error in service:', error.message);
      throw new Error(`Failed to upload resource: ${error.message}`);
    }
  }

  // Update resource status (for admin/moderation)
  async updateResourceStatus(id, status, userId, userRole) {
    try {
      const resource = await this.resourceRepository.findById(id, false);
      
      if (!resource) {
        throw new Error('Resource not found');
      }

      // Check permissions
      if (userRole !== 'admin' && resource.user_id !== userId) {
        throw new Error('Access denied: Insufficient permissions');
      }

      return await this.resourceRepository.updateStatus(id, status);
    } catch (error) {
      throw error;
    }
  }

  // Get resource statistics
  async getResourceStats(userId = null) {
    try {
      return await this.resourceRepository.getStats(userId);
    } catch (error) {
      throw new Error(`Failed to fetch resource stats: ${error.message}`);
    }
  }

  // Increment downloads count
  async incrementDownloads(id) {
    try {
      return await this.resourceRepository.incrementDownloads(id);
    } catch (error) {
      throw new Error(`Failed to increment downloads: ${error.message}`);
    }
  }
}

export default new ResourceService();