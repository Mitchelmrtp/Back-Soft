import express from 'express';
import {
  createReport,
  getUserReports,
  getReportDetails,
  getAdminReports,
  updateReportStatus,
  getReportStatistics,
  getResourceReports,
  deleteReport,
  getReportTypes
} from '../controllers/reportController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { validateReport } from '../validators/reportValidator.js';

const router = express.Router();

router.get('/types', getReportTypes);

// ===== USER ENDPOINTS (Authentication Required) =====

/**
 * @route   POST /api/reports
 * @desc    Create a new report
 * @access  Private
 */
router.post('/', authMiddleware, validateReport, createReport);

router.get('/my-reports', authMiddleware, getUserReports);

router.get('/:id', authMiddleware, getReportDetails);

router.get('/admin/all', authMiddleware, adminMiddleware, getAdminReports);

router.patch('/admin/:id/status', authMiddleware, adminMiddleware, updateReportStatus);

router.get('/admin/statistics', authMiddleware, adminMiddleware, getReportStatistics);

router.get('/admin/resources/:resourceId', authMiddleware, adminMiddleware, getResourceReports);

router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteReport);

export default router;