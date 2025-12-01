// 📚 Course Controller - University Repository System  
// Handles course management operations

import Course from '../models/Course.js';
import Career from '../models/Career.js';
import Faculty from '../models/Faculty.js';
import User from '../models/User.js';
import Resource from '../models/Resource.js';
import { Op } from 'sequelize';

export const courseController = {
  // Get all courses with pagination and search
  getCourses: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search = '', 
        career_id = null,
        semester = null,
        status = 'active',
        course_type = null 
      } = req.query;
      
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const whereClause = {
        status: status === 'all' ? { [Op.in]: ['active', 'inactive', 'suspended'] } : status
      };

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { code: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (career_id) whereClause.career_id = career_id;
      if (semester) whereClause.semester = semester;
      if (course_type) whereClause.course_type = course_type;

      const { rows: courses, count } = await Course.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Career,
            as: 'career',
            attributes: ['id', 'name', 'code']
          },
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'name', 'email', 'employee_id'],
            required: false
          },
          {
            model: Resource,
            as: 'resources',
            attributes: ['id', 'title', 'type', 'status'],
            required: false
          }
        ],
        order: [['semester', 'ASC'], ['name', 'ASC']],
        limit: parseInt(limit),
        offset
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      return res.success({
        courses,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      });

    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      return res.error('Error al obtener cursos', 500, error.message);
    }
  },

  // Get course by ID with detailed information
  getCourseById: async (req, res) => {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id, {
        include: [
          {
            model: Career,
            as: 'career',
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
            attributes: ['id', 'name', 'email', 'employee_id', 'department', 'position'],
            required: false
          },
          {
            model: Resource,
            as: 'resources',
            where: { status: 'published' },
            required: false,
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'name', 'role']
              }
            ]
          }
        ]
      });

      if (!course) {
        return res.error('Curso no encontrado', 404);
      }

      return res.success(course);

    } catch (error) {
      console.error('❌ Error fetching course:', error);
      return res.error('Error al obtener curso', 500, error.message);
    }
  },

  // Create new course
  createCourse: async (req, res) => {
    try {
      const {
        name,
        code,
        description,
        credits,
        semester,
        career_id,
        teacher_id,
        course_type = 'obligatory',
        hours_theory = 0,
        hours_practice = 0,
        hours_laboratory = 0,
        prerequisites = [],
        syllabus_url,
        metadata = {}
      } = req.body;

      // Validate required fields
      if (!name || !code || !credits || !semester || !career_id) {
        return res.error('Nombre, código, créditos, semestre y carrera son requeridos', 400);
      }

      // Check if code already exists
      const existingCourse = await Course.findOne({ where: { code } });
      if (existingCourse) {
        return res.error('El código de curso ya existe', 400);
      }

      // Validate career exists
      const career = await Career.findByPk(career_id);
      if (!career) {
        return res.error('Carrera no encontrada', 404);
      }

      // Validate teacher if provided
      if (teacher_id) {
        const teacher = await User.findOne({
          where: { 
            id: teacher_id, 
            role: 'teacher', 
            status: 'active' 
          }
        });
        if (!teacher) {
          return res.error('Profesor no encontrado o inactivo', 404);
        }
      }

      const course = await Course.create({
        name,
        code: code.toUpperCase(),
        description,
        credits,
        semester,
        career_id,
        teacher_id,
        course_type,
        hours_theory,
        hours_practice,
        hours_laboratory,
        prerequisites,
        syllabus_url,
        metadata
      });

      // Fetch complete course data
      const completeCourse = await Course.findByPk(course.id, {
        include: [
          {
            model: Career,
            as: 'career',
            attributes: ['id', 'name', 'code']
          },
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'name', 'email'],
            required: false
          }
        ]
      });

      return res.success(completeCourse, 'Curso creado exitosamente', 201);

    } catch (error) {
      console.error('❌ Error creating course:', error);
      return res.error('Error al crear curso', 500, error.message);
    }
  },

  // Update course
  updateCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const course = await Course.findByPk(id);
      if (!course) {
        return res.error('Curso no encontrado', 404);
      }

      // If updating code, check for uniqueness
      if (updateData.code && updateData.code !== course.code) {
        const existingCourse = await Course.findOne({ 
          where: { 
            code: updateData.code,
            id: { [Op.ne]: id }
          } 
        });
        if (existingCourse) {
          return res.error('El código de curso ya existe', 400);
        }
        updateData.code = updateData.code.toUpperCase();
      }

      // Validate teacher if being updated
      if (updateData.teacher_id) {
        const teacher = await User.findOne({
          where: { 
            id: updateData.teacher_id, 
            role: 'teacher', 
            status: 'active' 
          }
        });
        if (!teacher) {
          return res.error('Profesor no encontrado o inactivo', 404);
        }
      }

      await course.update(updateData);

      // Fetch updated course with relationships
      const updatedCourse = await Course.findByPk(id, {
        include: [
          {
            model: Career,
            as: 'career',
            attributes: ['id', 'name', 'code']
          },
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'name', 'email'],
            required: false
          }
        ]
      });

      return res.success(updatedCourse, 'Curso actualizado exitosamente');

    } catch (error) {
      console.error('❌ Error updating course:', error);
      return res.error('Error al actualizar curso', 500, error.message);
    }
  },

  // Delete course (soft delete)
  deleteCourse: async (req, res) => {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id);
      if (!course) {
        return res.error('Curso no encontrado', 404);
      }

      // Check if course has associated resources
      const resourceCount = await Resource.count({
        where: { course_id: id }
      });

      if (resourceCount > 0) {
        return res.error('No se puede eliminar el curso porque tiene recursos asociados', 400);
      }

      await course.update({ status: 'inactive' });

      return res.success(null, 'Curso eliminado exitosamente');

    } catch (error) {
      console.error('❌ Error deleting course:', error);
      return res.error('Error al eliminar curso', 500, error.message);
    }
  },

  // Get courses by career
  getCoursesByCareer: async (req, res) => {
    try {
      const { career_id } = req.params;
      const { semester = null } = req.query;

      const whereClause = { 
        career_id, 
        status: 'active' 
      };
      
      if (semester) whereClause.semester = semester;

      const courses = await Course.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'name', 'email'],
            required: false
          }
        ],
        order: [['semester', 'ASC'], ['name', 'ASC']]
      });

      return res.success(courses);

    } catch (error) {
      console.error('❌ Error fetching courses by career:', error);
      return res.error('Error al obtener cursos por carrera', 500, error.message);
    }
  },

  // Get course statistics
  getCourseStats: async (req, res) => {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id, {
        include: [
          {
            model: Resource,
            as: 'resources',
            attributes: ['id', 'status', 'type'],
            required: false
          }
        ]
      });

      if (!course) {
        return res.error('Curso no encontrado', 404);
      }

      // Calculate statistics
      const totalResources = course.resources.length;
      const publishedResources = course.resources.filter(r => r.status === 'published').length;
      const resourcesByType = course.resources.reduce((acc, resource) => {
        acc[resource.type] = (acc[resource.type] || 0) + 1;
        return acc;
      }, {});

      const stats = {
        course_info: {
          name: course.name,
          code: course.code,
          credits: course.credits,
          semester: course.semester
        },
        resources: {
          total: totalResources,
          published: publishedResources,
          by_type: resourcesByType
        }
      };

      return res.success(stats);

    } catch (error) {
      console.error('❌ Error fetching course stats:', error);
      return res.error('Error al obtener estadísticas de curso', 500, error.message);
    }
  },

  // Get courses by career
  getCoursesByCareer: async (req, res) => {
    try {
      const { career_id } = req.params;
      const { semester = null } = req.query;

      const whereClause = { 
        career_id, 
        status: 'active' 
      };
      
      if (semester) whereClause.semester = semester;

      const courses = await Course.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'name', 'email'],
            required: false
          }
        ],
        order: [['semester', 'ASC'], ['name', 'ASC']]
      });

      return res.success(courses);

    } catch (error) {
      console.error('❌ Error fetching courses by career:', error);
      return res.error('Error al obtener cursos por carrera', 500, error.message);
    }
  },

  // Get course statistics
  getCourseStats: async (req, res) => {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id, {
        include: [
          {
            model: Resource,
            as: 'resources',
            attributes: ['id', 'status', 'type'],
            required: false
          }
        ]
      });

      if (!course) {
        return res.error('Curso no encontrado', 404);
      }

      // Calculate statistics
      const totalResources = course.resources.length;
      const publishedResources = course.resources.filter(r => r.status === 'published').length;
      const resourcesByType = course.resources.reduce((acc, resource) => {
        acc[resource.type] = (acc[resource.type] || 0) + 1;
        return acc;
      }, {});

      const stats = {
        course_info: {
          name: course.name,
          code: course.code,
          credits: course.credits,
          semester: course.semester
        },
        resources: {
          total: totalResources,
          published: publishedResources,
          by_type: resourcesByType
        }
      };

      return res.success(stats);

    } catch (error) {
      console.error('❌ Error fetching course stats:', error);
      return res.error('Error al obtener estadísticas de curso', 500, error.message);
    }
  }
};