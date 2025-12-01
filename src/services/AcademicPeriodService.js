// 🔧 Academic Period Service - Business Logic Layer
// Following Service Layer Pattern and using Repository for data access

import AcademicPeriodRepository from '../repositories/AcademicPeriodRepository.js';

class AcademicPeriodService {
  constructor(academicPeriodRepository = AcademicPeriodRepository) {
    this.academicPeriodRepository = academicPeriodRepository;
  }

  // Create new academic period
  async createAcademicPeriod(academicPeriodData) {
    try {
      // Check if academic period already exists for the year and type
      const existingPeriod = await this.academicPeriodRepository.existsByYearAndType(
        academicPeriodData.year,
        academicPeriodData.period_type
      );
      
      if (existingPeriod) {
        throw new Error('Ya existe un período académico para este año y tipo');
      }

      return await this.academicPeriodRepository.create(academicPeriodData);
    } catch (error) {
      throw new Error(`Error creating academic period: ${error.message}`);
    }
  }

  // Get academic period by ID
  async getAcademicPeriod(id, includeAssociations = true) {
    try {
      const academicPeriod = await this.academicPeriodRepository.findById(id, includeAssociations);
      
      if (!academicPeriod) {
        throw new Error('Período académico no encontrado');
      }

      return academicPeriod;
    } catch (error) {
      throw new Error(`Error getting academic period: ${error.message}`);
    }
  }

  // Get all academic periods with filters and pagination
  async getAcademicPeriods(options = {}) {
    try {
      return await this.academicPeriodRepository.findAll(options);
    } catch (error) {
      throw new Error(`Error getting academic periods: ${error.message}`);
    }
  }

  // Update academic period
  async updateAcademicPeriod(id, updateData) {
    try {
      // Check if new year and type combination already exists (excluding current period)
      if (updateData.year && updateData.period_type) {
        const existingPeriod = await this.academicPeriodRepository.existsByYearAndType(
          updateData.year,
          updateData.period_type,
          id
        );
        
        if (existingPeriod) {
          throw new Error('Ya existe un período académico para este año y tipo');
        }
      }

      const updatedPeriod = await this.academicPeriodRepository.update(id, updateData);
      
      if (!updatedPeriod) {
        throw new Error('Período académico no encontrado');
      }

      return updatedPeriod;
    } catch (error) {
      throw new Error(`Error updating academic period: ${error.message}`);
    }
  }

  // Delete academic period
  async deleteAcademicPeriod(id) {
    try {
      return await this.academicPeriodRepository.delete(id);
    } catch (error) {
      throw new Error(`Error deleting academic period: ${error.message}`);
    }
  }

  // Get academic periods by year
  async getAcademicPeriodsByYear(year) {
    try {
      return await this.academicPeriodRepository.findByYear(year);
    } catch (error) {
      throw new Error(`Error getting academic periods by year: ${error.message}`);
    }
  }

  // Get current academic period
  async getCurrentAcademicPeriod() {
    try {
      const currentPeriod = await this.academicPeriodRepository.findCurrent();
      
      if (!currentPeriod) {
        throw new Error('No hay período académico activo actualmente');
      }

      return currentPeriod;
    } catch (error) {
      throw new Error(`Error getting current academic period: ${error.message}`);
    }
  }

  // Get active academic periods
  async getActiveAcademicPeriods() {
    try {
      return await this.academicPeriodRepository.findActive();
    } catch (error) {
      throw new Error(`Error getting active academic periods: ${error.message}`);
    }
  }

  // Get academic periods by status
  async getAcademicPeriodsByStatus(status) {
    try {
      return await this.academicPeriodRepository.findByStatus(status);
    } catch (error) {
      throw new Error(`Error getting academic periods by status: ${error.message}`);
    }
  }

  // Get academic periods by type
  async getAcademicPeriodsByType(periodType) {
    try {
      return await this.academicPeriodRepository.findByPeriodType(periodType);
    } catch (error) {
      throw new Error(`Error getting academic periods by type: ${error.message}`);
    }
  }

  // Get academic periods with course count
  async getAcademicPeriodsWithCourseCount() {
    try {
      return await this.academicPeriodRepository.findAllWithCourseCount();
    } catch (error) {
      throw new Error(`Error getting academic periods with course count: ${error.message}`);
    }
  }

  // Check if academic period exists for year and type
  async academicPeriodExists(year, periodType, excludeId = null) {
    try {
      return await this.academicPeriodRepository.existsByYearAndType(year, periodType, excludeId);
    } catch (error) {
      throw new Error(`Error checking academic period existence: ${error.message}`);
    }
  }
}

export default new AcademicPeriodService();