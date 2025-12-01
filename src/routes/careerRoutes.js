import express from 'express';
import {
  getCareers,
  getCareerById,
  createCareer,
  updateCareer,
  deleteCareer,
  getCareersByFaculty
} from '../controllers/careerController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', getCareers);
router.get('/faculty/:facultyId', getCareersByFaculty);
router.get('/:id', getCareerById);

router.post('/', authMiddleware, adminMiddleware, createCareer);
router.put('/:id', authMiddleware, adminMiddleware, updateCareer);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCareer);

export default router;