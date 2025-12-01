// 🛡️ Rating Validator - Input validation for rating operations
// Following Input Validation Pattern and SOLID principles

import Joi from 'joi';

/**
 * Validation schema for creating/updating a rating
 */
const ratingSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.base': 'El rating debe ser un número',
      'number.integer': 'El rating debe ser un número entero',
      'number.min': 'El rating debe ser al menos 1 estrella',
      'number.max': 'El rating no puede ser más de 5 estrellas',
      'any.required': 'El rating es obligatorio'
    }),
  
  content: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.base': 'El contenido debe ser texto',
      'string.min': 'El contenido debe tener al menos 1 caracter',
      'string.max': 'El contenido no puede exceder 1000 caracteres'
    })
});

/**
 * Middleware to validate rating creation/update
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateRating = (req, res, next) => {
  const { error, value } = ratingSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errorMessages
    });
  }

  // Replace request body with validated and sanitized data
  req.body = value;
  next();
};

export default {
  validateRating
};