// 📅 Academic Period Controller - Business logic for academic period management
// Following SOLID principles and Repository pattern

import AcademicPeriodService from '../services/AcademicPeriodService.js';

/**
 * Get all academic periods with optional filtering and pagination
 */
export const getAcademicPeriods = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      year,
      period_type,
      status = 'active',
      sort = 'academic_year',
      order = 'DESC'
    } = req.query;

    const result = await AcademicPeriodService.getAcademicPeriods({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      year,
      period_type,
      status,
      sort,
      order
    });

    res.success(result);
  } catch (error) {
    console.error('Error getting academic periods:', error);
    res.serverError('Error retrieving academic periods');
  }
};

/**
 * Get current academic period
 */
export const getCurrentAcademicPeriod = async (req, res) => {
  try {
    const result = await AcademicPeriodService.getCurrentAcademicPeriod();

    res.success(result);
  } catch (error) {
    console.error('Error getting current academic period:', error);
    res.serverError('Error retrieving current academic period');
  }
};

/**
 * Get academic period by ID
 */
export const getAcademicPeriodById = async (req, res) => {
  try {
    const { id } = req.params;

    const academicPeriod = await AcademicPeriodService.getAcademicPeriodById(id);

    if (!academicPeriod) {
      return res.notFound('Academic period not found');
    }

    res.success({ academic_period: academicPeriod });
  } catch (error) {
    console.error('Error getting academic period:', error);
    res.serverError('Error retrieving academic period');
  }
};

/**
 * Create new academic period
 */
export const createAcademicPeriod = async (req, res) => {
  try {
    const periodData = req.body;

    const academicPeriod = await AcademicPeriodService.createAcademicPeriod(periodData);

    res.created({ academic_period: academicPeriod });
  } catch (error) {
    console.error('Error creating academic period:', error);
    res.serverError('Error creating academic period');
  }
};

/**
 * Update academic period
 */
export const updateAcademicPeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const academicPeriod = await AcademicPeriodService.updateAcademicPeriod(id, updateData);

    res.success({ academic_period: academicPeriod });
  } catch (error) {
    console.error('Error updating academic period:', error);
    res.serverError('Error updating academic period');
  }
};

/**
 * Delete academic period
 */
export const deleteAcademicPeriod = async (req, res) => {
  try {
    const { id } = req.params;

    await AcademicPeriodService.deleteAcademicPeriod(id);

    res.success({ message: 'Academic period deleted successfully' });
  } catch (error) {
    console.error('Error deleting academic period:', error);
    res.serverError('Error deleting academic period');
  }
};