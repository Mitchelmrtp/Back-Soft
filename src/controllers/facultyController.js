// 🎓 Faculty Controller - University Repository System
// Handles faculty management operations

import FacultyService from '../services/FacultyService.js';

export const facultyController = {
  // Get all faculties with pagination and search
  getFaculties: async (req, res) => {
    try {
      const { page = 1, limit = 20, search = '', status = 'active' } = req.query;
      
      const result = await FacultyService.getFaculties({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status
      });

      return res.success(result);

    } catch (error) {
      console.error('❌ Error fetching faculties:', error);
      return res.error('Error al obtener facultades', 500, error.message);
    }
  },

  // Get faculty by ID with careers and faculty members
  getFacultyById: async (req, res) => {
    try {
      const { id } = req.params;

      const faculty = await FacultyService.getFacultyById(id);

      if (!faculty) {
        return res.error('Facultad no encontrada', 404);
      }

      return res.success(faculty);

    } catch (error) {
      console.error('❌ Error fetching faculty:', error);
      return res.error('Error al obtener facultad', 500, error.message);
    }
  },

  // Create new faculty
  createFaculty: async (req, res) => {
    try {
      const facultyData = req.body;

      const faculty = await FacultyService.createFaculty(facultyData);

      return res.success(faculty, 'Facultad creada exitosamente', 201);

    } catch (error) {
      console.error('❌ Error creating faculty:', error);
      return res.error('Error al crear facultad', 500, error.message);
    }
  },

  // Update faculty
  updateFaculty: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const faculty = await FacultyService.updateFaculty(id, updateData);

      return res.success(faculty, 'Facultad actualizada exitosamente');

    } catch (error) {
      console.error('❌ Error updating faculty:', error);
      return res.error('Error al actualizar facultad', 500, error.message);
    }
  },

  // Delete faculty (soft delete)
  deleteFaculty: async (req, res) => {
    try {
      const { id } = req.params;

      await FacultyService.deleteFaculty(id);

      return res.success(null, 'Facultad eliminada exitosamente');

    } catch (error) {
      console.error('❌ Error deleting faculty:', error);
      return res.error('Error al eliminar facultad', 500, error.message);
    }
  },

  // Get faculty statistics
  getFacultyStats: async (req, res) => {
    try {
      const { id } = req.params;

      const stats = await FacultyService.getFacultyStats(id);

      return res.success(stats);

    } catch (error) {
      console.error('❌ Error fetching faculty stats:', error);
      return res.error('Error al obtener estadísticas de facultad', 500, error.message);
    }
  }
};