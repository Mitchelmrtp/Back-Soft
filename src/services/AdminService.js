// 🔧 Admin Service - Coordinator Service for Administrative Operations
// Following Service Pattern and Composition over Inheritance
// Acts as a facade for specialized admin services

import StatsService from './StatsService.js';
import UserService from './UserService.js';
import ModerationService from './ModerationService.js';

/**
 * Main Admin Service that coordinates between specialized services
 * This service acts as a facade and delegates to more specific services
 */
class AdminService {
  constructor() {
    this.statsService = new StatsService();
    this.userService = UserService;
    this.moderationService = new ModerationService();
  }

  // 📊 Dashboard Statistics Methods
  async getDashboardStats() {
    return await this.statsService.getDashboardStats();
  }

  async getUserRegistrationStats(dateFrom, dateTo) {
    return await this.statsService.getUserRegistrationStats(dateFrom, dateTo);
  }

  async getResourceSubmissionStats(dateFrom, dateTo) {
    return await this.statsService.getResourceSubmissionStats(dateFrom, dateTo);
  }

  async getCategoryUsageStats(dateFrom, dateTo) {
    return await this.statsService.getCategoryUsageStats(dateFrom, dateTo);
  }

  // 👥 User Management Methods
  async getUsers(filters) {
    return await this.userService.searchUsers(filters);
  }

  async updateUser(userId, updateData) {
    return await this.userService.updateUser(userId, updateData);
  }

  async deactivateUser(userId) {
    return await this.userService.updateUser(userId, { status: 'suspended' });
  }

  async activateUser(userId) {
    return await this.userService.updateUser(userId, { status: 'active' });
  }

  async getUserDetails(userId) {
    return await this.userService.getUserProfile(userId);
  }

  // 📋 Resource Moderation Methods
  async getResourcesForModeration(filters) {
    return await this.moderationService.getResourcesForModeration(filters);
  }

  async moderateResource(resourceId, moderationData) {
    return await this.moderationService.moderateResource(resourceId, moderationData);
  }

  async getModerationStats() {
    return await this.moderationService.getModerationStats();
  }

  async getModerationHistory(resourceId) {
    return await this.moderationService.getModerationHistory(resourceId);
  }

  async getUrgentResources() {
    return await this.moderationService.getUrgentResources();
  }

  // 📈 Reporting Methods (combining multiple services)
  async getFullDashboardReport() {
    try {
      const [dashboardStats, moderationStats] = await Promise.all([
        this.getDashboardStats(),
        this.getModerationStats()
      ]);

      return {
        ...dashboardStats,
        moderation: moderationStats
      };
    } catch (error) {
      throw new Error(`Error generating full dashboard report: ${error.message}`);
    }
  }

  // 🔍 Search and Analytics
  async getAdminOverview() {
    try {
      const [urgentResources, moderationStats] = await Promise.all([
        this.getUrgentResources(),
        this.getModerationStats()
      ]);

      return {
        urgentItems: {
          resources: urgentResources.length,
          list: urgentResources.slice(0, 5) // Top 5 most urgent
        },
        moderation: moderationStats
      };
    } catch (error) {
      throw new Error(`Error getting admin overview: ${error.message}`);
    }
  }

  // 📊 Legacy support methods (for backward compatibility)
  async getReports(dateRange) {
    try {
      const { from, to } = dateRange;
      
      const [userStats, resourceStats, categoryStats] = await Promise.all([
        this.getUserRegistrationStats(from, to),
        this.getResourceSubmissionStats(from, to),
        this.getCategoryUsageStats(from, to)
      ]);

      return {
        period: { from, to },
        users: userStats,
        resources: resourceStats,
        categories: categoryStats
      };
    } catch (error) {
      throw new Error(`Error getting reports: ${error.message}`);
    }
  }
}

export default AdminService;