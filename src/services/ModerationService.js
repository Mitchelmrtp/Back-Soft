import ResourceRepository from '../repositories/ResourceRepository.js';

/**
 * Service para moderación de recursos
 * Siguiendo el principio de Single Responsibility
 */
class ModerationService {
  constructor(resourceRepository = ResourceRepository) {
    this.resourceRepository = resourceRepository;
  }

  /**
   * Obtiene recursos para moderación
   * @param {Object} options - Opciones de filtrado y paginación
   * @returns {Promise<Object>} Lista paginada de recursos para moderación
   */
  async getResourcesForModeration(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status = 'under_review',
        category = '',
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = options;

      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        category,
        sortBy,
        sortOrder: sortOrder.toUpperCase(),
        includeAuthor: true,
        includeCategory: true
      };

      const { count, resources } = await this.resourceRepository.findAllWithDetails(filters);

      const totalPages = Math.ceil(count / limit);

      return {
        resources,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error fetching resources for moderation: ${error.message}`);
    }
  }

  /**
   * Moderar un recurso (aprobar/rechazar)
   * @param {string} resourceId - ID del recurso
   * @param {Object} moderationData - Datos de moderación
   * @returns {Promise<Object>} Recurso moderado
   */
  async moderateResource(resourceId, moderationData) {
    try {
      const { action, reason, moderatorNotes } = moderationData;

      // Validate action
      const validActions = ['approve', 'reject', 'request_changes'];
      if (!validActions.includes(action)) {
        throw new Error(`Invalid moderation action: ${action}`);
      }

      // Get resource
      const resource = await this.resourceRepository.findById(resourceId);
      if (!resource) {
        throw new Error('Resource not found');
      }

      // Determine new status based on action
      let newStatus;
      switch (action) {
        case 'approve':
          newStatus = 'published';
          break;
        case 'reject':
          newStatus = 'rejected';
          break;
        case 'request_changes':
          newStatus = 'under_review';
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      // Prepare update data
      const updateData = {
        status: newStatus,
        moderated_at: new Date(),
        moderation_reason: reason || null,
        moderator_notes: moderatorNotes || null
      };

      // If rejecting, also update rejection reason
      if (action === 'reject') {
        updateData.rejection_reason = reason;
      }

      // Update resource
      await this.resourceRepository.update(resourceId, updateData);

      // Return updated resource
      return await this.resourceRepository.findById(resourceId);
    } catch (error) {
      throw new Error(`Error moderating resource: ${error.message}`);
    }
  }

  /**
   * Obtiene estadísticas de moderación
   * @returns {Promise<Object>} Estadísticas de moderación
   */
  async getModerationStats() {
    try {
      const [
        pending,
        approved,
        rejected,
        totalToday
      ] = await Promise.all([
        this.resourceRepository.countByStatus('under_review'),
        this.resourceRepository.countByStatus('published'),
        this.resourceRepository.countByStatus('rejected'),
        this.resourceRepository.countRecent(new Date(new Date().setHours(0, 0, 0, 0)))
      ]);

      return {
        pending,
        approved,
        rejected,
        totalToday,
        totalProcessed: approved + rejected
      };
    } catch (error) {
      throw new Error(`Error getting moderation stats: ${error.message}`);
    }
  }

  /**
   * Obtiene historial de moderación de un recurso
   * @param {string} resourceId - ID del recurso
   * @returns {Promise<Object>} Historial de moderación
   */
  async getModerationHistory(resourceId) {
    try {
      const resource = await this.resourceRepository.findById(resourceId);
      if (!resource) {
        throw new Error('Resource not found');
      }

      return {
        resourceId: resource.id,
        currentStatus: resource.status,
        moderatedAt: resource.moderated_at,
        moderationReason: resource.moderation_reason,
        moderatorNotes: resource.moderator_notes,
        rejectionReason: resource.rejection_reason
      };
    } catch (error) {
      throw new Error(`Error getting moderation history: ${error.message}`);
    }
  }

  /**
   * Obtiene recursos que requieren atención urgente
   * @returns {Promise<Array>} Lista de recursos urgentes
   */
  async getUrgentResources() {
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      
      const filters = {
        status: 'under_review',
        createdBefore: new Date(),
        createdAfter: threeDaysAgo,
        limit: 50,
        sortBy: 'created_at',
        sortOrder: 'ASC'
      };

      const { resources } = await this.resourceRepository.findAllWithDetails(filters);
      
      return resources;
    } catch (error) {
      throw new Error(`Error getting urgent resources: ${error.message}`);
    }
  }
}

export default ModerationService;