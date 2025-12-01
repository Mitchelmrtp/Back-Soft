// 🏥️ Repository Pattern - Data Access Layer for Academic Periods
// Following Repository Pattern and Single Responsibility Principle

import { AcademicPeriod, Course } from '../models/index.js';
import { Op } from 'sequelize';

class AcademicPeriodRepository {
  // Create new academic period
  async create(academicPeriodData) {
    try {
      return await AcademicPeriod.create(academicPeriodData);
    } catch (error) {
      throw new Error(`Error creating academic period: ${error.message}`);
    }
  }

  // Find academic period by ID with associations
  async findById(id, includeAssociations = true) {
    try {
      const includeOptions = includeAssociations ? [
        {
          model: Course,
          as: 'courses',
          attributes: ['id', 'name', 'code', 'semester', 'credits']
        }
      ] : [];

      return await AcademicPeriod.findByPk(id, {
        include: includeOptions
      });
    } catch (error) {
      throw new Error(`Error finding academic period by ID: ${error.message}`);
    }
  }

  // Find all academic periods with pagination and filters
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        year = null,
        period_type = null,
        status = null,
        search = null,
        includeCourses = false
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};
      
      if (year) {
        whereClause.year = year;
      }
      
      if (period_type) {
        whereClause.period_type = period_type;
      }
      
      if (status) {
        whereClause.status = status;
      }
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const includeOptions = [];

      if (includeCourses) {
        includeOptions.push({
          model: Course,
          as: 'courses',
          attributes: ['id', 'name', 'code']
        });
      }

      const result = await AcademicPeriod.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        limit,
        offset,
        order: [['year', 'DESC'], ['period_type', 'ASC']]
      });

      return {
        academicPeriods: result.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(result.count / limit),
          totalItems: result.count,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`Error finding academic periods: ${error.message}`);
    }
  }

  // Update academic period
  async update(id, updateData) {
    try {
      const [updatedRowsCount] = await AcademicPeriod.update(updateData, {
        where: { id }
      });
      
      if (updatedRowsCount === 0) {
        throw new Error('Academic period not found or no changes made');
      }
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating academic period: ${error.message}`);
    }
  }

  // Delete academic period
  async delete(id) {
    try {
      const deletedCount = await AcademicPeriod.destroy({
        where: { id }
      });
      
      if (deletedCount === 0) {
        throw new Error('Academic period not found');
      }
      
      return { deleted: true };
    } catch (error) {
      throw new Error(`Error deleting academic period: ${error.message}`);
    }
  }

  // Find academic periods by year
  async findByYear(year) {
    try {
      return await AcademicPeriod.findAll({
        where: { year },
        order: [['period_type', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error finding academic periods by year: ${error.message}`);
    }
  }

  // Find current academic period
  async findCurrent() {
    try {
      const currentDate = new Date();
      return await AcademicPeriod.findOne({
        where: {
          start_date: { [Op.lte]: currentDate },
          end_date: { [Op.gte]: currentDate },
          status: 'active'
        }
      });
    } catch (error) {
      throw new Error(`Error finding current academic period: ${error.message}`);
    }
  }

  // Find active academic periods
  async findActive() {
    try {
      return await AcademicPeriod.findAll({
        where: { status: 'active' },
        order: [['year', 'DESC'], ['period_type', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error finding active academic periods: ${error.message}`);
    }
  }

  // Find academic periods by status
  async findByStatus(status) {
    try {
      return await AcademicPeriod.findAll({
        where: { status },
        order: [['year', 'DESC'], ['period_type', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error finding academic periods by status: ${error.message}`);
    }
  }

  // Find academic periods by period type
  async findByPeriodType(periodType) {
    try {
      return await AcademicPeriod.findAll({
        where: { period_type: periodType },
        order: [['year', 'DESC']]
      });
    } catch (error) {
      throw new Error(`Error finding academic periods by type: ${error.message}`);
    }
  }

  // Check if academic period exists by year and period type
  async existsByYearAndType(year, periodType, excludeId = null) {
    try {
      const whereClause = { 
        year, 
        period_type: periodType 
      };
      
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }
      
      const academicPeriod = await AcademicPeriod.findOne({
        where: whereClause,
        attributes: ['id']
      });
      
      return !!academicPeriod;
    } catch (error) {
      throw new Error(`Error checking if academic period exists: ${error.message}`);
    }
  }

  // Find academic periods with course count
  async findAllWithCourseCount() {
    try {
      return await AcademicPeriod.findAll({
        include: [
          {
            model: Course,
            as: 'courses',
            attributes: []
          }
        ],
        attributes: [
          'id',
          'name',
          'year',
          'period_type',
          'status',
          'start_date',
          'end_date',
          [AcademicPeriod.sequelize.fn('COUNT', AcademicPeriod.sequelize.col('courses.id')), 'courseCount']
        ],
        group: ['AcademicPeriod.id'],
        order: [['year', 'DESC'], ['period_type', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error finding academic periods with course count: ${error.message}`);
    }
  }
}

export default new AcademicPeriodRepository();