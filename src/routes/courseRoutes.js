import express from 'express';
import { courseController } from '../controllers/courseController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);
router.get('/:id/stats', courseController.getCourseStats);
router.get('/career/:career_id', courseController.getCoursesByCareer);

router.post('/', authMiddleware, adminMiddleware, courseController.createCourse);
router.put('/:id', authMiddleware, adminMiddleware, courseController.updateCourse);
router.delete('/:id', authMiddleware, adminMiddleware, courseController.deleteCourse);

export default router;