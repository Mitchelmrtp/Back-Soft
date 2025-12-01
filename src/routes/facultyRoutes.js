import express from 'express';
import { facultyController } from '../controllers/facultyController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', facultyController.getFaculties);
router.get('/:id', facultyController.getFacultyById);
router.get('/:id/stats', facultyController.getFacultyStats);

router.post('/', authMiddleware, adminMiddleware, facultyController.createFaculty);
router.put('/:id', authMiddleware, adminMiddleware, facultyController.updateFaculty);
router.delete('/:id', authMiddleware, adminMiddleware, facultyController.deleteFaculty);

export default router;