// 🔧 Career Service - Business Logic Layer
// Following Service Layer Pattern and using Repository for data access

import CareerRepository from '../repositories/CareerRepository.js';

class CareerService {
  constructor(careerRepository = CareerRepository) {
    this.careerRepository = careerRepository;
  }

  // Create new career
  async createCareer(careerData) {
    try {
      // Check if career code already exists
      const existingCareer = await this.careerRepository.findByCode(careerData.code);
      
      if (existingCareer) {
        throw new Error('El código de carrera ya existe');
      }

      return await this.careerRepository.create(careerData);
    } catch (error) {
      throw new Error(`Error creating career: ${error.message}`);
    }
  }

  // Get career by ID
  async getCareer(id, includeAssociations = true) {
    try {
      const career = await this.careerRepository.findById(id, includeAssociations);
      
      if (!career) {
        throw new Error('Carrera no encontrada');
      }

      return career;
    } catch (error) {
      throw new Error(`Error getting career: ${error.message}`);
    }
  }

  // Get all careers with filters and pagination
  async getCareers(options = {}) {
    try {
      return await this.careerRepository.findAll(options);
    } catch (error) {
      throw new Error(`Error getting careers: ${error.message}`);
    }
  }

  // Update career
  async updateCareer(id, updateData) {
    try {
      // Check if new code already exists (excluding current career)
      if (updateData.code) {
        const existingCareer = await this.careerRepository.findByCode(updateData.code);
        
        if (existingCareer && existingCareer.id !== parseInt(id)) {
          throw new Error('El código de carrera ya existe');
        }
      }

      const updatedCareer = await this.careerRepository.update(id, updateData);
      
      if (!updatedCareer) {
        throw new Error('Carrera no encontrada');
      }

      return updatedCareer;
    } catch (error) {
      throw new Error(`Error updating career: ${error.message}`);
    }
  }

  // Delete career
  async deleteCareer(id) {
    try {
      return await this.careerRepository.delete(id);
    } catch (error) {
      throw new Error(`Error deleting career: ${error.message}`);
    }
  }

  // Get careers by faculty
  async getCareersByFaculty(facultyId) {
    try {
      return await this.careerRepository.findByFaculty(facultyId);
    } catch (error) {
      throw new Error(`Error getting careers by faculty: ${error.message}`);
    }
  }

  // Get career by code
  async getCareerByCode(code) {
    try {
      const career = await this.careerRepository.findByCode(code);
      
      if (!career) {
        throw new Error('Carrera no encontrada');
      }

      return career;
    } catch (error) {
      throw new Error(`Error getting career by code: ${error.message}`);
    }
  }

  // Get careers by director
  async getCareersByDirector(directorId) {
    try {
      return await this.careerRepository.findByDirector(directorId);
    } catch (error) {
      throw new Error(`Error getting careers by director: ${error.message}`);
    }
  }

  // Get careers with course count
  async getCareersWithCourseCount() {
    try {
      return await this.careerRepository.findAllWithCourseCount();
    } catch (error) {
      throw new Error(`Error getting careers with course count: ${error.message}`);
    }
  }

  // Check if career code exists
  async careerCodeExists(code, excludeId = null) {
    try {
      return await this.careerRepository.existsByCode(code, excludeId);
    } catch (error) {
      throw new Error(`Error checking career code existence: ${error.message}`);
    }
  }
}

export default new CareerService();