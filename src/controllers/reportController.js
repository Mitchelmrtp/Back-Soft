// 🚨 Report Controller - HTTP Layer for Report Management
// Following Single Responsibility Principle and Controller Pattern

import ReportService from '../services/ReportService.js';
import asyncHandler from '../middleware/asyncHandler.js';

/**
 * ReportController - Handles HTTP requests for report management
 * Follows Single Responsibility Principle
 * Interface Segregation: Clear separation of public vs admin endpoints
 */
class ReportController {
  constructor() {
    this.reportService = new ReportService();
  }

  /**
   * Create a new report
   * POST /api/reports
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createReport = asyncHandler(async (req, res) => {
    const { resource_id, type, reason, additional_info } = req.body;
    
    // For testing purposes, use a hardcoded user ID if no authentication
    const userId = req.user?.id || '7c59b450-4b70-4c79-aa3e-a2f796a28194'; // Test User Frontend
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    console.log('📝 Creating report:', { resource_id, type, reason, userId });

    const result = await this.reportService.createReport({
      resource_id,
      type,
      reason,
      additional_info
    }, userId, ipAddress, userAgent);

    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        id: result.data.id,
        type: result.data.type,
        status: result.data.status,
        created_at: result.data.created_at
      }
    });
  });

  /**
   * Get user's reports
   * GET /api/reports/my-reports
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUserReports = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;

    const options = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      status: status || null
    };

    const result = await this.reportService.getUserReports(userId, options);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  });

  /**
   * Get report details
   * GET /api/reports/:id
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getReportDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await this.reportService.getReportDetails(id);

    // Users can only see their own reports unless they're admin
    if (result.data.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este reporte'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  });

  // ===== ADMIN ENDPOINTS =====

  /**
   * Get all reports for admin dashboard
   * GET /api/admin/reports
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAdminReports = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      priority,
      search
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      status: status || null,
      type: type || null,
      priority: priority || null,
      search: search || null
    };

    const result = await this.reportService.getAdminReports(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      filters: filters
    });
  });

  /**
   * Update report status
   * PATCH /api/admin/reports/:id/status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateReportStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, resolution_notes, action_taken } = req.body;
    const moderatorId = req.user.id;

    // Validate required fields
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'El campo status es requerido'
      });
    }

    if (status === 'resolved' && !action_taken) {
      return res.status(400).json({
        success: false,
        message: 'El campo action_taken es requerido para resolver un reporte'
      });
    }

    const result = await this.reportService.updateReportStatus(id, {
      status,
      resolution_notes,
      action_taken
    }, moderatorId);

    res.json({
      success: true,
      message: result.message,
      data: result.data
    });
  });

  /**
   * Get report statistics
   * GET /api/admin/reports/statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getReportStatistics = asyncHandler(async (req, res) => {
    const { start_date, end_date } = req.query;

    const filters = {};
    if (start_date) filters.startDate = new Date(start_date);
    if (end_date) filters.endDate = new Date(end_date);

    const result = await this.reportService.getReportStatistics(filters);

    res.json({
      success: true,
      data: result.data
    });
  });

  /**
   * Get reports for a specific resource
   * GET /api/admin/resources/:resourceId/reports
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getResourceReports = asyncHandler(async (req, res) => {
    const { resourceId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    const options = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      status: status || null
    };

    const result = await this.reportService.getResourceReports(resourceId, options);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  });

  /**
   * Delete a report (admin only)
   * DELETE /api/admin/reports/:id
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteReport = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deleted = await this.reportService.deleteReport(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Reporte eliminado exitosamente'
    });
  });

  // ===== UTILITY ENDPOINTS =====

  /**
   * Get report types and their descriptions
   * GET /api/reports/types
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getReportTypes = asyncHandler(async (req, res) => {
    const reportTypes = [
      {
        value: 'inappropriate_content',
        label: 'Contenido inapropiado',
        description: 'Contenido que viola las normas de la comunidad'
      },
      {
        value: 'copyright_violation',
        label: 'Violación de derechos de autor',
        description: 'Contenido que infringe derechos de autor'
      },
      {
        value: 'spam',
        label: 'Spam',
        description: 'Contenido promocional no deseado o repetitivo'
      },
      {
        value: 'misleading_title',
        label: 'Título engañoso',
        description: 'El título no corresponde con el contenido'
      },
      {
        value: 'wrong_category',
        label: 'Categoría incorrecta',
        description: 'El recurso está en una categoría incorrecta'
      },
      {
        value: 'broken_file',
        label: 'Archivo dañado',
        description: 'El archivo no se puede abrir o está corrupto'
      },
      {
        value: 'other',
        label: 'Otro',
        description: 'Otro problema no listado aquí'
      }
    ];

    res.json({
      success: true,
      data: reportTypes
    });
  });
}

// Create controller instance and export methods
const reportController = new ReportController();

export const {
  createReport,
  getUserReports,
  getReportDetails,
  getAdminReports,
  updateReportStatus,
  getReportStatistics,
  getResourceReports,
  deleteReport,
  getReportTypes
} = reportController;