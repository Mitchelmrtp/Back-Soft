import UserRepository from '../repositories/UserRepository.js';
import ResourceRepository from '../repositories/ResourceRepository.js';
import CategoryRepository from '../repositories/CategoryRepository.js';

/**
 * Service para estadísticas del dashboard administrativo
 * Siguiendo el principio de Single Responsibility
 */
class StatsService {
  constructor(
    userRepository = UserRepository,
    resourceRepository = ResourceRepository,
    categoryRepository = CategoryRepository
  ) {
    this.userRepository = userRepository;
    this.resourceRepository = resourceRepository;
    this.categoryRepository = categoryRepository;
  }

  /**
   * Obtiene estadísticas generales del dashboard
   * @returns {Promise<Object>} Estadísticas del dashboard
   */
  async getDashboardStats() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        totalResources,
        totalCategories,
        publishedResources,
        pendingResources,
        recentUsers,
        recentResources
      ] = await Promise.all([
        this.userRepository.count(),
        this.resourceRepository.count(),
        this.categoryRepository.count(),
        this.resourceRepository.countByStatus('published'),
        this.resourceRepository.countByStatus('under_review'),
        this.userRepository.countRecent(thirtyDaysAgo),
        this.resourceRepository.countRecent(thirtyDaysAgo)
      ]);

      return {
        users: {
          total: totalUsers,
          recent: recentUsers
        },
        resources: {
          total: totalResources,
          published: publishedResources,
          pending: pendingResources,
          recent: recentResources
        },
        categories: {
          total: totalCategories
        },
        growth: {
          usersThisMonth: recentUsers,
          resourcesThisMonth: recentResources
        }
      };
    } catch (error) {
      throw new Error(`Error getting dashboard stats: ${error.message}`);
    }
  }

  /**
   * Obtiene estadísticas de registro de usuarios por fecha
   * @param {Date} dateFrom - Fecha de inicio
   * @param {Date} dateTo - Fecha de fin
   * @returns {Promise<Array>} Estadísticas de registro
   */
  async getUserRegistrationStats(dateFrom, dateTo) {
    try {
      return await this.userRepository.getRegistrationStatsByDate(dateFrom, dateTo);
    } catch (error) {
      throw new Error(`Error getting user registration stats: ${error.message}`);
    }
  }

  /**
   * Obtiene estadísticas de envío de recursos por fecha
   * @param {Date} dateFrom - Fecha de inicio
   * @param {Date} dateTo - Fecha de fin
   * @returns {Promise<Array>} Estadísticas de envío
   */
  async getResourceSubmissionStats(dateFrom, dateTo) {
    try {
      return await this.resourceRepository.getSubmissionStatsByDate(dateFrom, dateTo);
    } catch (error) {
      throw new Error(`Error getting resource submission stats: ${error.message}`);
    }
  }

  /**
   * Obtiene estadísticas de uso de categorías
   * @param {Date} dateFrom - Fecha de inicio
   * @param {Date} dateTo - Fecha de fin
   * @returns {Promise<Array>} Estadísticas de categorías
   */
  async getCategoryUsageStats(dateFrom, dateTo) {
    try {
      return await this.categoryRepository.getCategoryUsageStats(dateFrom, dateTo);
    } catch (error) {
      throw new Error(`Error getting category usage stats: ${error.message}`);
    }
  }
}

export default StatsService;