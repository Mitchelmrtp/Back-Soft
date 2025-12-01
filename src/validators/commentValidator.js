// ✅ Comment Validator - Input validation for comment operations
// Following validation middleware pattern

import { body, validationResult } from 'express-validator';

/**
 * Validation rules for creating/updating comments
 */
export const validateComment = [
  // Content validation
  body('content')
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters')
    .trim()
    .escape(), // Sanitize HTML

  // Parent ID validation (optional)
  body('parent_id')
    .optional()
    .isUUID(4)
    .withMessage('Parent ID must be a valid UUID'),

  // Check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

/**
 * Validation rules for comment moderation
 */
export const validateCommentModeration = [
  // Action validation
  body('action')
    .notEmpty()
    .withMessage('Moderation action is required')
    .isIn(['approve', 'hide', 'delete', 'flag'])
    .withMessage('Invalid moderation action'),

  // Reason validation (optional)
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters')
    .trim(),

  // Check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];