// 🛣️ Comment Routes - HTTP routes for comment operations
// Following RESTful API design principles

import express from 'express';
import {
  createComment,
  getResourceComments,
  getUserComments,
  getComment,
  updateComment,
  deleteComment,
  deleteResourceComment,
  getCommentStats,
  moderateComment,
  getModerationQueue,
  createReply,
  getCommentReplies
} from '../controllers/commentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { validateComment } from '../validators/commentValidator.js';

const router = express.Router();

router.get('/resource/:resourceId', getResourceComments);

router.get('/resource/:resourceId/stats', getCommentStats);

router.get('/:commentId', getComment);

router.get('/:commentId/replies', getCommentReplies);

router.post('/resource/:resourceId', authenticate, validateComment, createComment);

router.post('/:commentId/reply', authenticate, validateComment, createReply);

router.get('/user/my-comments', authenticate, getUserComments);

router.put('/:commentId', authenticate, validateComment, updateComment);

router.delete('/:commentId', authenticate, deleteComment);

router.delete('/resource/:resourceId/comment/:commentId', authenticate, deleteResourceComment);

router.get('/admin/moderation-queue', authenticate, adminOnly, getModerationQueue);

router.patch('/admin/:commentId/moderate', authenticate, adminOnly, moderateComment);

export default router;