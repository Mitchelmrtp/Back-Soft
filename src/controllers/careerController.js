// 🎓 Career Controller - Business logic for career/program management
// Following SOLID principles and Repository pattern

import CareerService from '../services/CareerService.js';

/**
 * Get all careers with optional filtering and pagination
 */
export const getCareers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      faculty_id,
      degree_type,
      status = 'active',
      sort = 'name',
      order = 'ASC'
    } = req.query;

    const result = await CareerService.getCareers({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      faculty_id,
      degree_type,
      status,
      sort,
      order
    });

    res.success(result);
  } catch (error) {
    console.error('Error getting careers:', error);
    res.status(500).json({ error: 'Error retrieving careers', message: error.message });
  }
};

/**
 * Get careers by faculty
 */
export const getCareersByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { status = 'active', sort = 'name', order = 'ASC' } = req.query;

    const result = await CareerService.getCareersByFaculty(facultyId, { status, sort, order });

    res.success(result);
  } catch (error) {
    console.error('Error getting careers by faculty:', error);
    res.status(500).json({ error: 'Error retrieving careers', message: error.message });
  }
};

/**
 * Get career by ID
 */
export const getCareerById = async (req, res) => {
  try {
    const { id } = req.params;

    const career = await CareerService.getCareerById(id);

    if (!career) {
      return res.notFound('Career not found');
    }

    res.success({ career });
  } catch (error) {
    console.error('Error getting career:', error);
    res.status(500).json({ error: 'Error retrieving career', message: error.message });
  }
};

/**
 * Create new career
 */
export const createCareer = async (req, res) => {
  try {
    const careerData = req.body;

    const career = await CareerService.createCareer(careerData);

    res.created({ career });
  } catch (error) {
    console.error('Error creating career:', error);
    res.status(500).json({ error: 'Error creating career', message: error.message });
  }
};

/**
 * Update career
 */
export const updateCareer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const career = await CareerService.updateCareer(id, updateData);

    res.success({ career });
  } catch (error) {
    console.error('Error updating career:', error);
    res.status(500).json({ error: 'Error updating career', message: error.message });
  }
};

/**
 * Delete career
 */
export const deleteCareer = async (req, res) => {
  try {
    const { id } = req.params;

    await CareerService.deleteCareer(id);

    res.success({ message: 'Career deleted successfully' });
  } catch (error) {
    console.error('Error deleting career:', error);
    res.status(500).json({ error: 'Error deleting career', message: error.message });
  }
};