import { Router } from 'express';
import { 
  getCategories,
  getCategoryById, 
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getRootCategories
} from '../controllers/categoryController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = Router();

// Public routes - no authentication required
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/roots', getRootCategories);
router.get('/:id', getCategoryById);

// Protected admin routes - require authentication and admin role
router.post('/', authMiddleware, adminMiddleware, createCategory);
router.put('/:id', authMiddleware, adminMiddleware, updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory);

export default router;