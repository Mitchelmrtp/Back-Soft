// 📅 Academic Period Routes - Academic semester/period management routes
// Following RESTful API principles and SOLID architecture

import express from 'express';
import {
  getAcademicPeriods,
  getAcademicPeriodById,
  createAcademicPeriod,
  updateAcademicPeriod,
  deleteAcademicPeriod,
  getCurrentAcademicPeriod
} from '../controllers/academicPeriodController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAcademicPeriods);
router.get('/current', getCurrentAcademicPeriod);
router.get('/:id', getAcademicPeriodById);

// Protected routes (admin only)
router.post('/', authMiddleware, adminMiddleware, createAcademicPeriod);
router.put('/:id', authMiddleware, adminMiddleware, updateAcademicPeriod);
router.delete('/:id', authMiddleware, adminMiddleware, deleteAcademicPeriod);

export default router;