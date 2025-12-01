// 🔧 User Service - Business Logic Layer
// Following Service Layer Pattern and using Repository for data access

import UserRepository from '../repositories/UserRepository.js';
import HashService from '../utils/HashService.js';
import { ValidationError } from '../utils/errors.js';
import { deleteFile } from './uploadService.js';
import profileObserver from '../observers/ProfileObserver.js';
import { Op } from 'sequelize';

class UserService {
  constructor(userRepository = UserRepository) {
    this.userRepository = userRepository;
  }

  // Search users with advanced filtering (Business Logic)
  async searchUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        role = null,
        status = 'active',
        search = null
      } = options;

      const offset = (page - 1) * limit;
      
      // Build search criteria (business logic)
      let whereClause = { status };
      
      if (role) {
        whereClause.role = role;
      }

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Use repository for simple data access
      const result = await this.userRepository.findAll({
        limit,
        offset,
        status,
        whereClause // Pass the constructed where clause
      });

      return result;
    } catch (error) {
      throw new Error(`Error searching users: ${error.message}`);
    }
  }

  // Get user profile by ID
  async getUserProfile(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return user.toSafeObject();
    } catch (error) {
      throw new Error(`Error getting user profile: ${error.message}`);
    }
  }

  // Update user profile (Enhanced with SOLID principles)
  async updateUserProfile(userId, updateData, avatarFile = null) {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const oldData = this.formatUserResponse(user);

      // Single Responsibility: Handle avatar separately
      if (avatarFile) {
        const avatarResult = await this.handleAvatarUpdate(user, avatarFile);
        updateData.avatar_url = avatarResult.avatar_url;
      }

      // Filter allowed fields for security (Open/Closed Principle)
      const allowedFields = this.getAllowedProfileFields();
      const sanitizedData = this.sanitizeUpdateData(updateData, allowedFields);

      const updatedUser = await this.userRepository.update(userId, sanitizedData);
      
      // Notify observers about profile changes
      const changes = this.getProfileChanges(oldData, sanitizedData);
      await profileObserver.notify('profile.updated', { 
        userId, 
        changes,
        oldData,
        newData: this.formatUserResponse(updatedUser)
      });

      if (avatarFile) {
        await profileObserver.notify('avatar.updated', { 
          userId, 
          oldAvatar: oldData.avatar,
          newAvatar: updateData.avatar_url 
        });
      }
      
      return this.formatUserResponse(updatedUser);
    } catch (error) {
      throw new Error(`Error updating user profile: ${error.message}`);
    }
  }

  // Single Responsibility: Avatar handling logic
  async handleAvatarUpdate(user, avatarFile) {
    try {
      // Delete old avatar if exists
      if (user.avatar_url) {
        await this.deleteOldAvatar(user.avatar_url);
      }
      
      // Process and save new avatar
      const avatarPath = await this.processAvatarUpload(avatarFile);
      
      return { avatar_url: avatarPath };
    } catch (error) {
      throw new Error(`Error handling avatar update: ${error.message}`);
    }
  }

  // Upload avatar separately (Single Responsibility)
  async uploadAvatar(userId, avatarFile) {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const avatarResult = await this.handleAvatarUpdate(user, avatarFile);
      
      await this.userRepository.update(userId, { avatar_url: avatarResult.avatar_url });

      return {
        avatar_url: avatarResult.avatar_url,
        message: 'Avatar actualizado exitosamente'
      };
    } catch (error) {
      throw new Error(`Error uploading avatar: ${error.message}`);
    }
  }

  // Open/Closed Principle: Easy to extend allowed fields
  getAllowedProfileFields() {
    return [
      'name', 'first_name', 'last_name', 'telephone', 'bio',
      'academic_degree', 'department', 'position', 'preferences', 'avatar_url'
    ];
  }

  // Liskov Substitution Principle: Consistent data sanitization
  sanitizeUpdateData(data, allowedFields) {
    const sanitized = {};
    
    allowedFields.forEach(field => {
      if (data.hasOwnProperty(field) && data[field] !== undefined) {
        sanitized[field] = data[field];
      }
    });

    return sanitized;
  }

  // Interface Segregation: Separate avatar deletion logic
  async deleteOldAvatar(avatarUrl) {
    try {
      if (avatarUrl.startsWith('http')) {
        // Extract relative path for deletion
        const relativePath = avatarUrl.replace('http://localhost:3001', '');
        await deleteFile(relativePath);
      } else {
        await deleteFile(avatarUrl);
      }
    } catch (deleteError) {
      console.warn('Could not delete old avatar:', deleteError.message);
      // Don't fail the entire operation for avatar deletion issues
    }
  }

  // Dependency Inversion: Abstract avatar processing
  async processAvatarUpload(avatarFile) {
    try {
      const timestamp = Date.now();
      const filename = `avatar-${timestamp}-${avatarFile.originalname}`;
      const uploadPath = `/uploads/profiles/${filename}`;
      
      // Move file to profiles directory
      const fs = await import('fs');
      const path = await import('path');
      
      const sourceFile = avatarFile.path;
      const targetDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
      const targetFile = path.join(targetDir, filename);
      
      // Ensure directory exists
      await fs.promises.mkdir(targetDir, { recursive: true });
      
      // Move file
      await fs.promises.rename(sourceFile, targetFile);
      
      const fullUrl = `http://localhost:3001${uploadPath}`;
      return fullUrl;
    } catch (error) {
      throw new Error(`Error processing avatar upload: ${error.message}`);
    }
  }

  // Single Responsibility: Format user response
  formatUserResponse(user) {
    // Return user data without sensitive fields
    if (user.toSafeObject) {
      return user.toSafeObject();
    }
    
    const { password, reset_password_token, ...safeUser } = user.toJSON ? user.toJSON() : user;
    return safeUser;
  }

  // Change user password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verify current password
      const isValidPassword = await this.authService.verifyPassword(currentPassword, user.password);
      
      if (!isValidPassword) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Hash new password and update
      const hashedNewPassword = await this.authService.hashPassword(newPassword);
      
      await this.userRepository.update(userId, { 
        password: hashedNewPassword 
      });

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      throw new Error(`Error changing password: ${error.message}`);
    }
  }

  // Get user settings/preferences
  async getUserSettings(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        preferences: user.preferences || {},
        userId: user.id
      };
    } catch (error) {
      throw new Error(`Error getting user settings: ${error.message}`);
    }
  }

  // Update user settings/preferences
  async updateUserSettings(userId, preferences) {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      await this.userRepository.update(userId, { preferences });

      return {
        message: 'Configuración actualizada exitosamente',
        preferences: preferences
      };
    } catch (error) {
      throw new Error(`Error updating user settings: ${error.message}`);
    }
  }

  // Upload user avatar
  async uploadAvatar(userId, avatarFile) {
    try {
      if (!avatarFile) {
        throw new Error('No se proporcionó archivo');
      }

      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Delete old avatar if exists
      if (user.profile_picture) {
        try {
          await deleteFile(user.profile_picture);
        } catch (deleteError) {
          console.warn('Could not delete old avatar:', deleteError.message);
        }
      }

      // Update user with new avatar path
      const avatarPath = avatarFile.path.replace(/\\/g, '/').replace(process.cwd().replace(/\\/g, '/') + '/public', '');
      
      const updatedUser = await this.userRepository.update(userId, { 
        profile_picture: avatarPath 
      });

      return {
        message: 'Avatar actualizado exitosamente',
        avatar_url: avatarPath,
        user: updatedUser.toSafeObject()
      };
    } catch (error) {
      throw new Error(`Error uploading avatar: ${error.message}`);
    }
  }

  // Create new user (for registration)
  async createUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      
      if (existingUser) {
        throw new ValidationError('El email ya está registrado');
      }

      // Hash password before creating user
      if (userData.password) {
        userData.password = await HashService.hashPassword(userData.password);
      }

      // Set default values
      userData.status = userData.status || 'active';

      const newUser = await this.userRepository.create(userData);
      
      return newUser;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Get all users with filters and pagination
  async getUsers(options = {}) {
    try {
      return await this.userRepository.findAll(options);
    } catch (error) {
      throw new Error(`Error getting users: ${error.message}`);
    }
  }

  // Get users by role
  async getUsersByRole(role) {
    try {
      return await this.userRepository.findByRole(role);
    } catch (error) {
      throw new Error(`Error getting users by role: ${error.message}`);
    }
  }

  // Soft delete user
  async deleteUser(userId) {
    try {
      return await this.userRepository.delete(userId);
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Check if user exists by email
  async userExistsByEmail(email) {
    try {
      return await this.userRepository.existsByEmail(email);
    } catch (error) {
      throw new Error(`Error checking user existence: ${error.message}`);
    }
  }

  /**
   * Get user profile by ID
   * @param {number} userId - User ID
   * @returns {Object} User profile
   */
  async getUserProfile(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ValidationError('Usuario no encontrado');
    }
    return this.formatUserResponse(user);
  }

  /**
   * Change user password
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ValidationError('Usuario no encontrado');
    }

    // Verify current password
    const isCurrentPasswordValid = await HashService.verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new ValidationError('La contraseña actual es incorrecta');
    }

    // Hash new password
    const hashedNewPassword = await HashService.hashPassword(newPassword);
    
    // Update password
    await this.userRepository.update(userId, { password: hashedNewPassword });
    
    // Notify observers
    await profileObserver.notify('password.changed', { userId });
  }

  /**
   * Delete user avatar
   * @param {number} userId - User ID
   * @returns {Object} Updated user profile
   */
  async deleteAvatar(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ValidationError('Usuario no encontrado');
    }

    const oldAvatar = user.avatar;

    // Delete old avatar file if exists
    if (user.avatar) {
      await this.deleteOldAvatar(user.avatar);
    }

    // Update user avatar to null
    const updatedUser = await this.userRepository.update(userId, { avatar: null });
    
    // Notify observers
    await profileObserver.notify('avatar.updated', { 
      userId, 
      oldAvatar,
      newAvatar: null 
    });
    
    return this.formatUserResponse(updatedUser);
  }

  /**
   * Get user statistics
   * @param {number} userId - User ID
   * @returns {Object} User statistics
   */
  async getUserStats(userId) {
    // Import models here to avoid circular dependencies
    const { Resource, Favorite, ResourceLike } = await import('../models/index.js');
    
    const stats = await Promise.all([
      // Count user's resources
      Resource.count({ where: { user_id: userId } }),
      // Count user's favorites
      Favorite.count({ where: { user_id: userId } }),
      // Count likes on user's resources
      Resource.findAll({
        where: { user_id: userId },
        include: [{
          model: ResourceLike,
          as: 'likes'
        }]
      }).then(resources => {
        return resources.reduce((total, resource) => total + (resource.likes?.length || 0), 0);
      })
    ]);

    return {
      resources_count: stats[0],
      favorites_count: stats[1],
      likes_received: stats[2],
      profile_completion: await this.calculateProfileCompletion(userId)
    };
  }

  /**
   * Get user activity history
   * @param {number} userId - User ID
   * @param {Object} options - Pagination options
   * @returns {Object} User activity data
   */
  async getUserActivity(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;
    
    // Import models here to avoid circular dependencies
    const { Resource, Favorite, ResourceLike } = await import('../models/index.js');
    
    // Get recent resources created by user
    const recentResources = await Resource.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: Math.floor(limit / 2),
      offset: Math.floor(offset / 2)
    });

    // Get recent favorites
    const recentFavorites = await Favorite.findAll({
      where: { user_id: userId },
      include: [{
        model: Resource,
        as: 'resource'
      }],
      order: [['created_at', 'DESC']],
      limit: Math.floor(limit / 2),
      offset: Math.floor(offset / 2)
    });

    return {
      recent_resources: recentResources,
      recent_favorites: recentFavorites,
      pagination: {
        page,
        limit,
        total_items: recentResources.length + recentFavorites.length
      }
    };
  }

  /**
   * Calculate profile completion percentage
   * @param {number} userId - User ID
   * @returns {number} Profile completion percentage
   */
  async calculateProfileCompletion(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) return 0;

    const fields = ['name', 'email', 'avatar', 'phone', 'bio', 'department'];
    const filledFields = fields.filter(field => user[field] && user[field].trim() !== '');
    
    return Math.round((filledFields.length / fields.length) * 100);
  }

  /**
   * Compare profile data to identify changes
   * @param {Object} oldData - Original profile data
   * @param {Object} newData - Updated profile data
   * @returns {Object} Changes made
   */
  getProfileChanges(oldData, newData) {
    const changes = {};
    const fieldsToCheck = ['name', 'phone', 'bio', 'department', 'position'];
    
    fieldsToCheck.forEach(field => {
      if (oldData[field] !== newData[field]) {
        changes[field] = {
          from: oldData[field],
          to: newData[field]
        };
      }
    });
    
    return changes;
  }
}

export default new UserService();