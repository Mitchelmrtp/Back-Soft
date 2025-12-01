// 🏥️ Repository Pattern - Data Access Layer for Faculties
// Following Repository Pattern and Single Responsibility Principle

import { Faculty, Career, User } from '../models/index.js';
import { Op } from 'sequelize';

class FacultyRepository {
  // Create new faculty
  async create(facultyData) {
    try {
      return await Faculty.create(facultyData);
    } catch (error) {
      throw new Error(`Error creating faculty: ${error.message}`);
    }
  }

  // Find faculty by ID with associations
  async findById(id, includeAssociations = true) {
    try {
      const includeOptions = includeAssociations ? [
        {
          model: Career,
          as: 'careers',
          attributes: ['id', 'name', 'code', 'description', 'duration_semesters']
        },
        {
          model: User,
          as: 'faculty_members',
          attributes: ['id', 'name', 'email', 'employee_id']
        }
      ] : [];

      return await Faculty.findByPk(id, {
        include: includeOptions
      });
    } catch (error) {
      throw new Error(`Error finding faculty by ID: ${error.message}`);
    }
  }

  // Find all faculties with pagination and filters
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = null,
        includeCareers = true
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { code: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const includeOptions = [];
      
      if (includeCareers) {
        includeOptions.push({
          model: Career,
          as: 'careers',
          attributes: ['id', 'name', 'code', 'duration_semesters']
        });
      }

      includeOptions.push({
        model: User,
        as: 'faculty_members',
        attributes: ['id', 'name', 'email']
      });

      const result = await Faculty.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        limit,
        offset,
        order: [['name', 'ASC']]
      });

      return {
        faculties: result.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(result.count / limit),
          totalItems: result.count,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`Error finding faculties: ${error.message}`);
    }
  }

  // Update faculty
  async update(id, updateData) {
    try {
      const [updatedRowsCount] = await Faculty.update(updateData, {
        where: { id }
      });
      
      if (updatedRowsCount === 0) {
        throw new Error('Faculty not found or no changes made');
      }
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating faculty: ${error.message}`);
    }
  }

  // Delete faculty
  async delete(id) {
    try {
      const deletedCount = await Faculty.destroy({
        where: { id }
      });
      
      if (deletedCount === 0) {
        throw new Error('Faculty not found');
      }
      
      return { deleted: true };
    } catch (error) {
      throw new Error(`Error deleting faculty: ${error.message}`);
    }
  }

  // Find faculty by code
  async findByCode(code) {
    try {
      return await Faculty.findOne({
        where: { code },
        include: [
          {
            model: Career,
            as: 'careers',
            attributes: ['id', 'name', 'code']
          },
          {
            model: User,
            as: 'dean',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error finding faculty by code: ${error.message}`);
    }
  }

  // Check if faculty exists by code
  async existsByCode(code, excludeId = null) {
    try {
      const whereClause = { code };
      
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }
      
      const faculty = await Faculty.findOne({
        where: whereClause,
        attributes: ['id']
      });
      
      return !!faculty;
    } catch (error) {
      throw new Error(`Error checking if faculty exists: ${error.message}`);
    }
  }

  // Find faculties with career count
  async findAllWithCareerCount() {
    try {
      return await Faculty.findAll({
        include: [
          {
            model: Career,
            as: 'careers',
            attributes: []
          },
          {
            model: User,
            as: 'dean',
            attributes: ['id', 'name', 'email']
          }
        ],
        attributes: [
          'id',
          'name',
          'code',
          'description',
          [Faculty.sequelize.fn('COUNT', Faculty.sequelize.col('careers.id')), 'careerCount']
        ],
        group: ['Faculty.id', 'dean.id'],
        order: [['name', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error finding faculties with career count: ${error.message}`);
    }
  }

  // Find faculties by dean
  async findByDean(deanId) {
    try {
      return await Faculty.findAll({
        where: { dean_id: deanId },
        include: [
          {
            model: Career,
            as: 'careers',
            attributes: ['id', 'name', 'code']
          }
        ],
        order: [['name', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error finding faculties by dean: ${error.message}`);
    }
  }
}

export default new FacultyRepository();