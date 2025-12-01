// 🔧 Course Service - Business Logic Layer
// Following Service Layer Pattern and using Repository for data access

import CourseRepository from '../repositories/CourseRepository.js';

class CourseService {
  constructor(courseRepository = CourseRepository) {
    this.courseRepository = courseRepository;
  }

  // Create new course
  async createCourse(courseData) {
    try {
      // Check if course code already exists
      const existingCourse = await this.courseRepository.existsByCode(courseData.code);
      
      if (existingCourse) {
        throw new Error('El código de curso ya existe');
      }

      return await this.courseRepository.create(courseData);
    } catch (error) {
      throw new Error(`Error creating course: ${error.message}`);
    }
  }

  // Get course by ID
  async getCourse(id, includeAssociations = true) {
    try {
      const course = await this.courseRepository.findById(id, includeAssociations);
      
      if (!course) {
        throw new Error('Curso no encontrado');
      }

      return course;
    } catch (error) {
      throw new Error(`Error getting course: ${error.message}`);
    }
  }

  // Get all courses with filters and pagination
  async getCourses(options = {}) {
    try {
      return await this.courseRepository.findAll(options);
    } catch (error) {
      throw new Error(`Error getting courses: ${error.message}`);
    }
  }

  // Update course
  async updateCourse(id, updateData) {
    try {
      // Check if new code already exists (excluding current course)
      if (updateData.code) {
        const codeExists = await this.courseRepository.existsByCode(updateData.code, id);
        
        if (codeExists) {
          throw new Error('El código de curso ya existe');
        }
      }

      const updatedCourse = await this.courseRepository.update(id, updateData);
      
      if (!updatedCourse) {
        throw new Error('Curso no encontrado');
      }

      return updatedCourse;
    } catch (error) {
      throw new Error(`Error updating course: ${error.message}`);
    }
  }

  // Delete course
  async deleteCourse(id) {
    try {
      return await this.courseRepository.delete(id);
    } catch (error) {
      throw new Error(`Error deleting course: ${error.message}`);
    }
  }

  // Get courses by career
  async getCoursesByCareer(careerId) {
    try {
      return await this.courseRepository.findByCareer(careerId);
    } catch (error) {
      throw new Error(`Error getting courses by career: ${error.message}`);
    }
  }

  // Get courses by teacher
  async getCoursesByTeacher(teacherId) {
    try {
      return await this.courseRepository.findByTeacher(teacherId);
    } catch (error) {
      throw new Error(`Error getting courses by teacher: ${error.message}`);
    }
  }

  // Get courses by academic period
  async getCoursesByAcademicPeriod(academicPeriodId) {
    try {
      return await this.courseRepository.findByAcademicPeriod(academicPeriodId);
    } catch (error) {
      throw new Error(`Error getting courses by academic period: ${error.message}`);
    }
  }

  // Check if course code exists
  async courseCodeExists(code, excludeId = null) {
    try {
      return await this.courseRepository.existsByCode(code, excludeId);
    } catch (error) {
      throw new Error(`Error checking course code existence: ${error.message}`);
    }
  }
}

export default new CourseService();