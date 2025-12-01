// 👤 Profile Controller - User profile management
// Following Single Responsibility Principle and RESTful design

import fs from 'fs';
import UserService from '../services/UserService.js';
import ValidatorFactory from '../validators/ValidatorFactory.js';
import { 
  UpdateProfileCommand, 
  ChangePasswordCommand, 
  DeleteAvatarCommand,
  ProfileCommandInvoker 
} from '../patterns/ProfileCommands.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import path from 'path';

class ProfileController {
  constructor() {
    this.commandInvoker = new ProfileCommandInvoker();
  }
  /**
   * Get current user profile
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.userId; // Cambiado de req.user.id a req.user.userId
      const profile = await UserService.getUserProfile(userId);

      if (!profile) {
        throw new NotFoundError('Perfil no encontrado');
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al obtener el perfil'
      });
    }
  }

  /**
   * Update user profile
   * @param {Object} req - Request object  
   * @param {Object} res - Response object
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      
      // Use Factory Pattern to get appropriate validator
      const profileValidator = ValidatorFactory.createValidator('profile');
      // For partial updates, don't require all fields (default behavior)
      const validatedData = profileValidator.validateUpdateProfile(req.body, { requireComplete: false });
      
      
      // Handle avatar upload if present
      const avatarFile = req.file;
      let updateData = { ...validatedData };
      
      if (avatarFile) {
        // Use Factory Pattern to get avatar validator
        const avatarValidator = ValidatorFactory.createValidator('avatar');
        avatarValidator.validateAvatar(avatarFile);
        updateData.avatar = avatarFile;
      }

      // Call UserService directly instead of using Command Pattern
      const updatedProfile = await UserService.updateUserProfile(userId, updateData);

      res.json({
        success: true,
        message: 'Perfil actualizado correctamente',
        data: updatedProfile
      });
    } catch (error) {
      // Clean up uploaded file if error occurs
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }

      console.error('Error updating profile:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al actualizar el perfil'
      });
    }
  }

  /**
   * Change user password
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async changePassword(req, res) {
    try {
      const userId = req.user.userId;
      
      // Use Factory Pattern to get user validator
      const userValidator = ValidatorFactory.createValidator('user');
      const validatedData = userValidator.validateChangePassword(req.body);
      
      // Use Command Pattern to execute password change
      const changePasswordCommand = new ChangePasswordCommand(
        UserService,
        userId, 
        validatedData.currentPassword, 
        validatedData.newPassword
      );
      
      await this.commandInvoker.executeCommand(changePasswordCommand);

      res.json({
        success: true,
        message: 'Contraseña actualizada correctamente'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al cambiar la contraseña'
      });
    }
  }

  /**
   * Delete user avatar
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteAvatar(req, res) {
    try {
      const userId = req.user.userId;
      
      // Use Command Pattern to execute avatar deletion
      const deleteAvatarCommand = new DeleteAvatarCommand(UserService, userId);
      const updatedProfile = await this.commandInvoker.executeCommand(deleteAvatarCommand);

      res.json({
        success: true,
        message: 'Avatar eliminado correctamente',
        data: updatedProfile,
        canUndo: deleteAvatarCommand.canUndo()
      });
    } catch (error) {
      console.error('Error deleting avatar:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al eliminar el avatar'
      });
    }
  }

  /**
   * Upload user avatar
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async uploadAvatar(req, res) {
    try {
      const userId = req.user.userId;
      const avatarFile = req.file;

      if (!avatarFile) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      // Use Factory Pattern to get avatar validator
      const avatarValidator = ValidatorFactory.createValidator('avatar');
      avatarValidator.validateAvatar(avatarFile);

      // Call UserService directly with avatarFile parameter
      // Pass empty object as updateData since avatar_url will be added by handleAvatarUpdate
      const updatedProfile = await UserService.updateUserProfile(userId, {}, avatarFile);

      res.json({
        success: true,
        message: 'Avatar subido correctamente',
        data: updatedProfile
      });
    } catch (error) {
      // Clean up uploaded file if error occurs
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }

      console.error('Error uploading avatar:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al subir el avatar'
      });
    }
  }

  /**
   * Get profile statistics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getProfileStats(req, res) {
    try {
      const userId = req.user.userId;
      
      const stats = await UserService.getUserStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting profile stats:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al obtener estadísticas del perfil'
      });
    }
  }

  /**
   * Get user activity history
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getActivity(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 10 } = req.query;
      
      const activity = await UserService.getUserActivity(userId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      console.error('Error getting user activity:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al obtener la actividad del usuario'
      });
    }
  }

  /**
   * Undo last profile action
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async undoLastAction(req, res) {
    try {
      if (!this.commandInvoker.canUndo()) {
        return res.status(400).json({
          success: false,
          message: 'No hay acciones para deshacer'
        });
      }

      await this.commandInvoker.undo();

      res.json({
        success: true,
        message: 'Última acción deshecha correctamente',
        canUndo: this.commandInvoker.canUndo(),
        canRedo: this.commandInvoker.canRedo()
      });
    } catch (error) {
      console.error('Error undoing action:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al deshacer la acción'
      });
    }
  }

  /**
   * Get command history
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getCommandHistory(req, res) {
    try {
      const history = this.commandInvoker.getHistory();

      res.json({
        success: true,
        data: {
          history,
          canUndo: this.commandInvoker.canUndo(),
          canRedo: this.commandInvoker.canRedo()
        }
      });
    } catch (error) {
      console.error('Error getting command history:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al obtener el historial de comandos'
      });
    }
  }
}

export default new ProfileController();