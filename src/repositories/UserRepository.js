// 🏥️ Repository Pattern - Data Access Layer for Users
// Following Repository Pattern and Single Responsibility Principle

import { User, UserPermission, Permission } from '../models/index.js';
import { Op } from 'sequelize';

class UserRepository {
  // Create new user
  async create(userData) {
    try {
      return await User.create(userData);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Find user by ID
  async findById(id, includeAssociations = false) {
    try {
      const includeOptions = includeAssociations ? [
        {
          model: UserPermission,
          as: 'userPermissions',
          include: [
            {
              model: Permission,
              as: 'permission',
              attributes: ['id', 'name', 'description']
            }
          ]
        }
      ] : [];

      return await User.findByPk(id, {
        include: includeOptions
      });
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  // Find user by email
  async findByEmail(email) {
    try {
      return await User.findOne({
        where: { email }
      });
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Update user
  async update(id, updateData) {
    try {
      const [updatedRowsCount] = await User.update(updateData, {
        where: { id }
      });
      
      if (updatedRowsCount === 0) {
        throw new Error('User not found or no changes made');
      }
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Delete user (soft delete by updating status)
  async delete(id) {
    try {
      return await this.update(id, { 
        status: 'deleted',
        updated_at: new Date()
      });
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Find all users with basic options
  async findAll(options = {}) {
    try {
      const {
        limit = 10,
        offset = 0,
        status = 'active'
      } = options;

      const result = await User.findAndCountAll({
        where: { status },
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: ['id', 'name', 'email', 'role', 'status', 'created_at', 'updated_at'],
        order: [['created_at', 'DESC']]
      });

      return {
        users: result.rows,
        total: result.count,
        totalPages: Math.ceil(result.count / limit),
        currentPage: Math.floor(offset / limit) + 1
      };
    } catch (error) {
      throw new Error(`Error finding users: ${error.message}`);
    }
  }

  // Update last login
  async updateLastLogin(id) {
    try {
      return await this.update(id, { 
        last_login_at: new Date(),
        updated_at: new Date()
      });
    } catch (error) {
      throw new Error(`Error updating last login: ${error.message}`);
    }
  }

  // Check if user exists by email
  async existsByEmail(email) {
    try {
      const count = await User.count({
        where: { email }
      });
      return count > 0;
    } catch (error) {
      throw new Error(`Error checking email existence: ${error.message}`);
    }
  }

  // Find active user by ID
  async findActiveById(id) {
    try {
      return await User.findOne({
        where: { 
          id,
          status: 'active'
        }
      });
    } catch (error) {
      throw new Error(`Error finding active user: ${error.message}`);
    }
  }

  // Count total users
  async count() {
    try {
      return await User.count({
        where: { status: 'active' }
      });
    } catch (error) {
      throw new Error(`Error counting users: ${error.message}`);
    }
  }
}

export default new UserRepository();