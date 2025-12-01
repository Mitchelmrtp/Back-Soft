// 🚨 Report Repository - Data Access Layer for Reports
// Following Single Responsibility Principle and Repository Pattern

import Report from '../models/Report.js';
import Resource from '../models/Resource.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

/**
 * ReportRepository - Handles all database operations for reports
 * Follows Repository Pattern and Single Responsibility Principle
 * Interface Segregation: Only exposes needed methods
 */
class ReportRepository {
  
  /**
   * Create a new report
   * @param {Object} reportData - Report data
   * @returns {Promise<Object>} Created report
   */
  async create(reportData) {
    try {
      const report = await Report.create(reportData);
      return this.findById(report.id);
    } catch (error) {
      throw new Error(`Failed to create report: ${error.message}`);
    }
  }

  /**
   * Find report by ID with related data
   * @param {number} id - Report ID
   * @returns {Promise<Object|null>} Report with relations
   */
  async findById(id) {
    try {
      return await Report.findByPk(id, {
        include: [
          {
            model: User,
            as: 'reporter',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Resource,
            as: 'resource',
          attributes: ['id', 'title', 'description', 'format'],
          },
          {
            model: User,
            as: 'resolver',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
    } catch (error) {
      throw new Error(`Failed to find report: ${error.message}`);
    }
  }

  /**
   * Find reports by resource ID
   * @param {number} resourceId - Resource ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Reports for resource
   */
  async findByResourceId(resourceId, options = {}) {
    try {
      const {
        status = null,
        limit = 50,
        offset = 0,
        orderBy = 'created_at',
        orderDirection = 'DESC'
      } = options;

      const whereClause = { resource_id: resourceId };
      if (status) {
        whereClause.status = status;
      }

      return await Report.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'reporter',
            attributes: ['id', 'name']
          }
        ],
        limit,
        offset,
        order: [[orderBy, orderDirection]]
      });
    } catch (error) {
      throw new Error(`Failed to find reports by resource: ${error.message}`);
    }
  }

  /**
   * Find reports by user ID
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Reports by user
   */
  async findByUserId(userId, options = {}) {
    try {
      const {
        status = null,
        limit = 50,
        offset = 0,
        orderBy = 'created_at',
        orderDirection = 'DESC'
      } = options;

      const whereClause = { user_id: userId };
      if (status) {
        whereClause.status = status;
      }

      return await Report.findAll({
        where: whereClause,
        include: [
          {
            model: Resource,
            as: 'resource',
            attributes: ['id', 'title', 'format']
          }
        ],
        limit,
        offset,
        order: [[orderBy, orderDirection]]
      });
    } catch (error) {
      throw new Error(`Failed to find reports by user: ${error.message}`);
    }
  }

  /**
   * Get reports for admin dashboard
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Paginated reports
   */
  async findForAdmin(filters = {}) {
    try {
      const {
        status = null,
        type = null,
        priority = null,
        page = 1,
        limit = 20,
        search = null
      } = filters;

      const whereClause = {};
      
      if (status) whereClause.status = status;
      if (type) whereClause.type = type;
      if (priority) whereClause.priority = priority;

      const include = [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'name', 'email'],
          where: search ? {
            [Op.or]: [
              { name: { [Op.iLike]: `%${search}%` } },
              { email: { [Op.iLike]: `%${search}%` } }
            ]
          } : undefined,
          required: !!search
        },
        {
          model: Resource,
          as: 'resource',
          attributes: ['id', 'title', 'description', 'format'],
          where: search ? {
            [Op.or]: [
              { title: { [Op.iLike]: `%${search}%` } },
              { description: { [Op.iLike]: `%${search}%` } }
            ]
          } : undefined,
          required: false
        }
      ];

      const offset = (page - 1) * limit;

      const { count, rows } = await Report.findAndCountAll({
        where: whereClause,
        include,
        limit,
        offset,
        order: [['created_at', 'DESC']],
        distinct: true
      });

      return {
        reports: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to find reports for admin: ${error.message}`);
    }
  }

  /**
   * Update report status
   * @param {number} id - Report ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated report
   */
  async updateStatus(id, updateData) {
    try {
      const { status, resolved_by, resolution_notes, action_taken } = updateData;
      
      const updateFields = { status };
      
      if (status === 'resolved') {
        updateFields.resolved_at = new Date();
        updateFields.resolved_by = resolved_by;
        updateFields.resolution_notes = resolution_notes;
        updateFields.action_taken = action_taken;
      }

      await Report.update(updateFields, {
        where: { id }
      });

      return this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update report: ${error.message}`);
    }
  }

  /**
   * Check if user already reported a resource
   * @param {number} userId - User ID
   * @param {number} resourceId - Resource ID
   * @returns {Promise<boolean>} True if already reported
   */
  async hasUserReported(userId, resourceId) {
    try {
      const existingReport = await Report.findOne({
        where: {
          user_id: userId,
          resource_id: resourceId,
          status: ['pending', 'reviewing']
        }
      });
      return !!existingReport;
    } catch (error) {
      throw new Error(`Failed to check existing report: ${error.message}`);
    }
  }

  /**
   * Get report statistics
   * @param {Object} filters - Date and other filters
   * @returns {Promise<Object>} Report statistics
   */
  async getStatistics(filters = {}) {
    try {
      const { startDate, endDate } = filters;
      const whereClause = {};
      
      if (startDate && endDate) {
        whereClause.created_at = {
          [Op.between]: [startDate, endDate]
        };
      }

      const [totalReports, pendingReports, resolvedReports, reportsByType] = await Promise.all([
        Report.count({ where: whereClause }),
        Report.count({ where: { ...whereClause, status: 'pending' } }),
        Report.count({ where: { ...whereClause, status: 'resolved' } }),
        Report.findAll({
          attributes: ['type', [sequelize.fn('COUNT', '*'), 'count']],
          where: whereClause,
          group: ['type'],
          raw: true
        })
      ]);

      return {
        total: totalReports,
        pending: pendingReports,
        resolved: resolvedReports,
        byType: reportsByType.reduce((acc, item) => {
          acc[item.type] = parseInt(item.count);
          return acc;
        }, {})
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  /**
   * Delete report (admin only)
   * @param {number} id - Report ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const deletedCount = await Report.destroy({
        where: { id }
      });
      return deletedCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete report: ${error.message}`);
    }
  }
}

export default ReportRepository;