// 🏥️ Repository Pattern - Data Access Layer for Careers
// Following Repository Pattern and Single Responsibility Principle

import { Career, Faculty, User, Course } from '../models/index.js';
import { Op } from 'sequelize';

class CareerRepository {
  // Create new career
  async create(careerData) {
    try {
      return await Career.create(careerData);
    } catch (error) {
      throw new Error(`Error creating career: ${error.message}`);
    }
  }

  // Find career by ID with associations
  async findById(id, includeAssociations = true) {
    try {
      const includeOptions = includeAssociations ? [
        {
          model: Faculty,
          as: 'faculty',
          attributes: ['id', 'name', 'code', 'description']
        },
        {
          model: User,
          as: 'director',
          attributes: ['id', 'name', 'email', 'employee_id']
        },
        {
          model: Course,
          as: 'courses',
          attributes: ['id', 'name', 'code', 'semester', 'credits']
        }
      ] : [];

      return await Career.findByPk(id, {
        include: includeOptions
      });
    } catch (error) {
      throw new Error(`Error finding career by ID: ${error.message}`);
    }
  }

  // Find all careers with pagination and filters
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        facultyId = null,
        search = null,
        includeCourses = false
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};
      
      if (facultyId) {
        whereClause.faculty_id = facultyId;
      }
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { code: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const includeOptions = [
        {
          model: Faculty,
          as: 'faculty',
          attributes: ['id', 'name', 'code']
        }
      ];

      if (includeCourses) {
        includeOptions.push({
          model: Course,
          as: 'courses',
          attributes: ['id', 'name', 'code', 'semester']
        });
      }

      const result = await Career.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        limit,
        offset,
        order: [['name', 'ASC']]
      });

      return {
        careers: result.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(result.count / limit),
          totalItems: result.count,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`Error finding careers: ${error.message}`);
    }
  }

  // Update career
  async update(id, updateData) {
    try {
      const [updatedRowsCount] = await Career.update(updateData, {
        where: { id }
      });
      
      if (updatedRowsCount === 0) {
        throw new Error('Career not found or no changes made');
      }
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating career: ${error.message}`);
    }
  }

  // Delete career
  async delete(id) {
    try {
      const deletedCount = await Career.destroy({
        where: { id }
      });
      
      if (deletedCount === 0) {
        throw new Error('Career not found');
      }
      
      return { deleted: true };
    } catch (error) {
      throw new Error(`Error deleting career: ${error.message}`);
    }
  }

  // Find careers by faculty
  async findByFaculty(facultyId) {
    try {
      return await Career.findAll({
        where: { faculty_id: facultyId },
        include: [
          {
            model: Faculty,
            as: 'faculty',
            attributes: ['id', 'name', 'code']
          },
          {
            model: User,
            as: 'director',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['name', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error finding careers by faculty: ${error.message}`);
    }
  }

  // Find career by code
  async findByCode(code) {
    try {
      return await Career.findOne({
        where: { code },
        include: [
          {
            model: Faculty,
            as: 'faculty',
            attributes: ['id', 'name', 'code']
          },
          {
            model: User,
            as: 'director',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error finding career by code: ${error.message}`);
    }
  }

  // Check if career exists by code
  async existsByCode(code, excludeId = null) {
    try {
      const whereClause = { code };
      
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }
      
      const career = await Career.findOne({
        where: whereClause,
        attributes: ['id']
      });
      
      return !!career;
    } catch (error) {
      throw new Error(`Error checking if career exists: ${error.message}`);
    }
  }

  // Find careers by director
  async findByDirector(directorId) {
    try {
      return await Career.findAll({
        where: { director_id: directorId },
        include: [
          {
            model: Faculty,
            as: 'faculty',
            attributes: ['id', 'name', 'code']
          }
        ],
        order: [['name', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error finding careers by director: ${error.message}`);
    }
  }

  // Find careers with course count
  async findAllWithCourseCount() {
    try {
      return await Career.findAll({
        include: [
          {
            model: Faculty,
            as: 'faculty',
            attributes: ['id', 'name', 'code']
          },
          {
            model: User,
            as: 'director',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Course,
            as: 'courses',
            attributes: []
          }
        ],
        attributes: [
          'id',
          'name',
          'code',
          'description',
          'duration_years',
          [Career.sequelize.fn('COUNT', Career.sequelize.col('courses.id')), 'courseCount']
        ],
        group: ['Career.id', 'faculty.id', 'director.id'],
        order: [['name', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error finding careers with course count: ${error.message}`);
    }
  }
}

export default new CareerRepository();