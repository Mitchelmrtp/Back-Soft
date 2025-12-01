// 🔧 Faculty Service - Business Logic Layer
// Following Service Layer Pattern and using Repository for data access

import FacultyRepository from '../repositories/FacultyRepository.js';

class FacultyService {
  constructor(facultyRepository = FacultyRepository) {
    this.facultyRepository = facultyRepository;
  }

  // Create new faculty
  async createFaculty(facultyData) {
    try {
      // Check if faculty code already exists
      const existingFaculty = await this.facultyRepository.findByCode(facultyData.code);
      
      if (existingFaculty) {
        throw new Error('El código de facultad ya existe');
      }

      return await this.facultyRepository.create(facultyData);
    } catch (error) {
      throw new Error(`Error creating faculty: ${error.message}`);
    }
  }

  // Get faculty by ID
  async getFaculty(id, includeAssociations = true) {
    try {
      const faculty = await this.facultyRepository.findById(id, includeAssociations);
      
      if (!faculty) {
        throw new Error('Facultad no encontrada');
      }

      return faculty;
    } catch (error) {
      throw new Error(`Error getting faculty: ${error.message}`);
    }
  }

  // Get all faculties with filters and pagination
  async getFaculties(options = {}) {
    try {
      return await this.facultyRepository.findAll(options);
    } catch (error) {
      throw new Error(`Error getting faculties: ${error.message}`);
    }
  }

  // Update faculty
  async updateFaculty(id, updateData) {
    try {
      // Check if new code already exists (excluding current faculty)
      if (updateData.code) {
        const existingFaculty = await this.facultyRepository.findByCode(updateData.code);
        
        if (existingFaculty && existingFaculty.id !== parseInt(id)) {
          throw new Error('El código de facultad ya existe');
        }
      }

      const updatedFaculty = await this.facultyRepository.update(id, updateData);
      
      if (!updatedFaculty) {
        throw new Error('Facultad no encontrada');
      }

      return updatedFaculty;
    } catch (error) {
      throw new Error(`Error updating faculty: ${error.message}`);
    }
  }

  // Delete faculty
  async deleteFaculty(id) {
    try {
      return await this.facultyRepository.delete(id);
    } catch (error) {
      throw new Error(`Error deleting faculty: ${error.message}`);
    }
  }

  // Get faculty by code
  async getFacultyByCode(code) {
    try {
      const faculty = await this.facultyRepository.findByCode(code);
      
      if (!faculty) {
        throw new Error('Facultad no encontrada');
      }

      return faculty;
    } catch (error) {
      throw new Error(`Error getting faculty by code: ${error.message}`);
    }
  }

  // Get faculties by dean
  async getFacultiesByDean(deanId) {
    try {
      return await this.facultyRepository.findByDean(deanId);
    } catch (error) {
      throw new Error(`Error getting faculties by dean: ${error.message}`);
    }
  }

  // Get faculties with career count
  async getFacultiesWithCareerCount() {
    try {
      return await this.facultyRepository.findAllWithCareerCount();
    } catch (error) {
      throw new Error(`Error getting faculties with career count: ${error.message}`);
    }
  }

  // Check if faculty code exists
  async facultyCodeExists(code, excludeId = null) {
    try {
      return await this.facultyRepository.existsByCode(code, excludeId);
    } catch (error) {
      throw new Error(`Error checking faculty code existence: ${error.message}`);
    }
  }
}

export default new FacultyService();