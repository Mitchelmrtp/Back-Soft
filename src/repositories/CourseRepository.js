// 🏥️ Repository Pattern - Data Access Layer for Courses
// Following Repository Pattern and Single Responsibility Principle

import { Course, Career, Faculty, User, AcademicPeriod } from '../models/index.js';
import { Op } from 'sequelize';

class CourseRepository {
  // Create new course
  async create(courseData) {
    try {
      return await Course.create(courseData);
    } catch (error) {
      throw new Error(`Error creating course: ${error.message}`);
    }
  }

  // Find course by ID with associations
  async findById(id, includeAssociations = true) {
    try {
      const includeOptions = includeAssociations ? [
        {
          model: Career,
          as: 'career',
          attributes: ['id', 'name', 'code', 'description'],
          include: [
            {
              model: Faculty,
              as: 'faculty',
              attributes: ['id', 'name', 'code', 'description']
            }
          ]
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email', 'employee_id']
        },
        {
          model: AcademicPeriod,
          as: 'academicPeriod',
          attributes: ['id', 'name', 'year', 'period_type', 'start_date', 'end_date']
        }
      ] : [];

      return await Course.findByPk(id, {
        include: includeOptions
      });
    } catch (error) {
      throw new Error(`Error finding course by ID: ${error.message}`);
    }
  }

  // Find all courses with pagination and filters
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        careerId = null,
        facultyId = null,
        teacherId = null,
        academicPeriodId = null,
        search = null,
        semester = null
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};
      
      if (careerId) {
        whereClause.career_id = careerId;
      }
      
      if (teacherId) {
        whereClause.teacher_id = teacherId;
      }
      
      if (academicPeriodId) {
        whereClause.academic_period_id = academicPeriodId;
      }
      
      if (semester) {
        whereClause.semester = semester;
      }
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { code: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Include faculty filter if provided
      const includeOptions = [
        {
          model: Career,
          as: 'career',
          attributes: ['id', 'name', 'code'],
          ...(facultyId && {
            where: { faculty_id: facultyId }
          }),
          include: [
            {
              model: Faculty,
              as: 'faculty',
              attributes: ['id', 'name', 'code']
            }
          ]
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email']
        },
        {
          model: AcademicPeriod,
          as: 'academicPeriod',
          attributes: ['id', 'name', 'year']
        }
      ];

      const result = await Course.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        limit,
        offset,
        order: [['name', 'ASC']]
      });

      return {
        courses: result.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(result.count / limit),
          totalItems: result.count,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`Error finding courses: ${error.message}`);
    }
  }

  // Update course
  async update(id, updateData) {
    try {
      const [updatedRowsCount] = await Course.update(updateData, {
        where: { id }
      });
      
      if (updatedRowsCount === 0) {
        throw new Error('Course not found or no changes made');
      }
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating course: ${error.message}`);
    }
  }

  // Delete course
  async delete(id) {
    try {
      const deletedCount = await Course.destroy({
        where: { id }
      });
      
      if (deletedCount === 0) {
        throw new Error('Course not found');
      }
      
      return { deleted: true };
    } catch (error) {
      throw new Error(`Error deleting course: ${error.message}`);
    }
  }

  // Find courses by career
  async findByCareer(careerId) {
    try {
      return await Course.findAll({
        where: { career_id: careerId },
        include: [
          {
            model: Career,
            as: 'career',
            attributes: ['id', 'name', 'code']
          },
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['semester', 'ASC'], ['name', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error finding courses by career: ${error.message}`);
    }
  }

  // Find courses by teacher
  async findByTeacher(teacherId) {
    try {
      return await Course.findAll({
        where: { teacher_id: teacherId },
        include: [
          {
            model: Career,
            as: 'career',
            attributes: ['id', 'name', 'code'],
            include: [
              {
                model: Faculty,
                as: 'faculty',
                attributes: ['id', 'name', 'code']
              }
            ]
          },
          {
            model: AcademicPeriod,
            as: 'academicPeriod',
            attributes: ['id', 'name', 'year']
          }
        ],
        order: [['name', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error finding courses by teacher: ${error.message}`);
    }
  }

  // Find courses by academic period
  async findByAcademicPeriod(academicPeriodId) {
    try {
      return await Course.findAll({
        where: { academic_period_id: academicPeriodId },
        include: [
          {
            model: Career,
            as: 'career',
            attributes: ['id', 'name', 'code'],
            include: [
              {
                model: Faculty,
                as: 'faculty',
                attributes: ['id', 'name', 'code']
              }
            ]
          },
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['name', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error finding courses by academic period: ${error.message}`);
    }
  }

  // Check if course exists by code
  async existsByCode(code, excludeId = null) {
    try {
      const whereClause = { code };
      
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }
      
      const course = await Course.findOne({
        where: whereClause,
        attributes: ['id']
      });
      
      return !!course;
    } catch (error) {
      throw new Error(`Error checking if course exists: ${error.message}`);
    }
  }
}

export default new CourseRepository();