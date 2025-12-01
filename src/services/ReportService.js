// 🚨 Report Service - Business Logic Layer for Reports
// Following Single Responsibility Principle and Service Layer Pattern

import ReportRepository from '../repositories/ReportRepository.js';
import ResourceRepository from '../repositories/ResourceRepository.js';
import UserRepository from '../repositories/UserRepository.js';
import ErrorProcessingService from './ErrorProcessingService.js';

/**
 * ReportService - Handles business logic for resource reports
 * Follows Single Responsibility Principle and Dependency Inversion
 * Open/Closed: Extensible for new report types and workflows
 */
class ReportService {
  constructor() {
    this.reportRepository = new ReportRepository();
    this.resourceRepository = ResourceRepository;
    this.userRepository = UserRepository;
    this.errorProcessor = ErrorProcessingService;
    
    // Report type configurations with priority mapping
    this.reportTypeConfig = {
      inappropriate_content: { priority: 'high', autoReview: false },
      copyright_violation: { priority: 'urgent', autoReview: false },
      spam: { priority: 'medium', autoReview: true },
      misleading_title: { priority: 'low', autoReview: true },
      wrong_category: { priority: 'low', autoReview: true },
      broken_file: { priority: 'medium', autoReview: false },
      other: { priority: 'medium', autoReview: false }
    };
  }

  /**
   * Create a new report
   * Validates data, checks for duplicates, and sets priority
   * @param {Object} reportData - Report creation data
   * @param {number} userId - ID of reporting user
   * @param {string} ipAddress - Reporter's IP address
   * @param {string} userAgent - Reporter's user agent
   * @returns {Promise<Object>} Created report
   */
  async createReport(reportData, userId, ipAddress = null, userAgent = null) {
    try {
      const { resource_id, type, reason, additional_info } = reportData;

      // Validation
      await this._validateReportData(reportData);
      
      // Check if resource exists
      const resource = await this.resourceRepository.findById(resource_id);
      if (!resource) {
        throw new Error('El recurso especificado no existe');
      }

      // Check if user already reported this resource
      const hasReported = await this.reportRepository.hasUserReported(userId, resource_id);
      if (hasReported) {
        throw new Error('Ya has reportado este recurso. Solo puedes hacer un reporte por recurso.');
      }

      // Get priority based on report type
      const config = this.reportTypeConfig[type] || this.reportTypeConfig.other;
      
      // Create report with metadata
      const report = await this.reportRepository.create({
        user_id: userId,
        resource_id,
        type,
        reason,
        additional_info,
        priority: config.priority,
        status: 'pending',
        ip_address: ipAddress,
        user_agent: userAgent
      });

      // If auto-review is enabled for this type, trigger automated processing
      if (config.autoReview) {
        this._triggerAutoReview(report.id);
      }

      // Notify moderators for high/urgent priority reports
      if (['high', 'urgent'].includes(config.priority)) {
        this._notifyModerators(report);
      }

      return {
        success: true,
        data: report,
        message: 'Reporte enviado exitosamente. Nuestro equipo lo revisará pronto.'
      };

    } catch (error) {
      throw ErrorProcessingService.processError(error);
    }
  }

  /**
   * Get user's reports
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User's reports
   */
  async getUserReports(userId, options = {}) {
    try {
      const reports = await this.reportRepository.findByUserId(userId, options);
      
      return {
        success: true,
        data: reports.map(report => this._formatReportForUser(report))
      };

    } catch (error) {
      throw this.errorProcessor.process(error, 'getUserReports');
    }
  }

  /**
   * Get reports for a resource (admin only)
   * @param {number} resourceId - Resource ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Resource reports
   */
  async getResourceReports(resourceId, options = {}) {
    try {
      const reports = await this.reportRepository.findByResourceId(resourceId, options);
      
      return {
        success: true,
        data: reports
      };

    } catch (error) {
      throw this.errorProcessor.process(error, 'getResourceReports');
    }
  }

  /**
   * Get all reports for admin dashboard
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Paginated reports
   */
  async getAdminReports(filters = {}) {
    try {
      const result = await this.reportRepository.findForAdmin(filters);
      
      return {
        success: true,
        data: result.reports,
        pagination: result.pagination
      };

    } catch (error) {
      throw this.errorProcessor.process(error, 'getAdminReports');
    }
  }

  /**
   * Update report status (admin/moderator only)
   * @param {number} reportId - Report ID
   * @param {Object} updateData - Update data
   * @param {number} moderatorId - ID of moderator updating
   * @returns {Promise<Object>} Updated report
   */
  async updateReportStatus(reportId, updateData, moderatorId) {
    try {
      const { status, resolution_notes, action_taken } = updateData;

      // Validate status transition
      await this._validateStatusTransition(reportId, status);

      const updatedReport = await this.reportRepository.updateStatus(reportId, {
        status,
        resolved_by: moderatorId,
        resolution_notes,
        action_taken
      });

      // If report is resolved, execute the action
      if (status === 'resolved' && action_taken) {
        await this._executeReportAction(updatedReport, action_taken);
      }

      return {
        success: true,
        data: updatedReport,
        message: `Reporte ${status === 'resolved' ? 'resuelto' : 'actualizado'} exitosamente`
      };

    } catch (error) {
      throw this.errorProcessor.process(error, 'updateReportStatus');
    }
  }

  /**
   * Get report statistics for admin dashboard
   * @param {Object} filters - Date and other filters
   * @returns {Promise<Object>} Report statistics
   */
  async getReportStatistics(filters = {}) {
    try {
      const stats = await this.reportRepository.getStatistics(filters);
      
      return {
        success: true,
        data: {
          ...stats,
          resolutionRate: stats.total > 0 ? (stats.resolved / stats.total * 100).toFixed(2) : 0
        }
      };

    } catch (error) {
      throw this.errorProcessor.process(error, 'getReportStatistics');
    }
  }

  /**
   * Get single report details
   * @param {number} reportId - Report ID
   * @returns {Promise<Object>} Report details
   */
  async getReportDetails(reportId) {
    try {
      const report = await this.reportRepository.findById(reportId);
      
      if (!report) {
        throw new Error('Reporte no encontrado');
      }

      return {
        success: true,
        data: report
      };

    } catch (error) {
      throw this.errorProcessor.process(error, 'getReportDetails');
    }
  }

  // ===== PRIVATE METHODS =====

  /**
   * Validate report data
   * @private
   */
  async _validateReportData(reportData) {
    const { resource_id, type, reason } = reportData;

    if (!resource_id || !type || !reason) {
      throw new Error('Todos los campos obligatorios deben ser completados');
    }

    if (!Object.keys(this.reportTypeConfig).includes(type)) {
      throw new Error(`Tipo de reporte inválido: ${type}`);
    }

    if (reason.length < 10) {
      throw new Error('La razón del reporte debe tener al menos 10 caracteres');
    }

    if (reason.length > 1000) {
      throw new Error('La razón del reporte no puede exceder 1000 caracteres');
    }
  }

  /**
   * Format report for user response
   * @private
   */
  _formatReportForUser(report) {
    return {
      id: report.id,
      resource: {
        id: report.resource.id,
        title: report.resource.title,
        format: report.resource.format
      },
      type: report.type,
      reason: report.reason,
      status: report.status,
      created_at: report.created_at,
      resolved_at: report.resolved_at
    };
  }

  /**
   * Validate status transition
   * @private
   */
  async _validateStatusTransition(reportId, newStatus) {
    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new Error('Reporte no encontrado');
    }

    const validTransitions = {
      pending: ['reviewing', 'dismissed'],
      reviewing: ['resolved', 'dismissed', 'pending'],
      resolved: [], // Final state
      dismissed: ['pending', 'reviewing'] // Can be reopened
    };

    if (!validTransitions[report.status].includes(newStatus)) {
      throw new Error(`Transición de estado inválida: ${report.status} -> ${newStatus}`);
    }
  }

  /**
   * Execute action based on report resolution
   * @private
   */
  async _executeReportAction(report, action) {
    try {
      switch (action) {
        case 'content_removed':
          // Logic to remove or hide content
          await this._hideResource(report.resource_id);
          break;
        case 'warning_issued':
          // Logic to issue warning to resource author
          await this._issueWarning(report.resource.author.id, report);
          break;
        case 'category_changed':
          // Logic to change resource category
          // This would need additional parameters
          break;
        case 'user_suspended':
          // Logic to suspend user
          await this._suspendUser(report.resource.author.id, report);
          break;
        default:
          // No action needed
          break;
      }
    } catch (error) {
      console.error(`Failed to execute report action ${action}:`, error);
      // Don't throw error here to avoid breaking the report resolution
    }
  }

  /**
   * Hide/remove resource
   * @private
   */
  async _hideResource(resourceId) {
    // Implementation would depend on your Resource model
    // This is a placeholder
    console.log(`Resource ${resourceId} would be hidden/removed`);
  }

  /**
   * Issue warning to user
   * @private
   */
  async _issueWarning(userId, report) {
    // Implementation would involve notifications or warning system
    console.log(`Warning issued to user ${userId} for report ${report.id}`);
  }

  /**
   * Suspend user
   * @private
   */
  async _suspendUser(userId, report) {
    // Implementation would involve user suspension logic
    console.log(`User ${userId} would be suspended for report ${report.id}`);
  }

  /**
   * Trigger automated review for certain report types
   * @private
   */
  _triggerAutoReview(reportId) {
    // This would trigger background processing
    console.log(`Auto-review triggered for report ${reportId}`);
  }

  /**
   * Notify moderators for urgent reports
   * @private
   */
  _notifyModerators(report) {
    // This would send notifications to moderators
    console.log(`Moderators notified for urgent report ${report.id}`);
  }
}

export default ReportService;