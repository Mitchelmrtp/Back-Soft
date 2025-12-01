// 🔍 Faculty Validator - Validation rules for faculty operations
// Following Strategy Pattern and consistent validation structure

import Joi from 'joi';

class FacultyValidator {
  // Validation schema for creating faculty
  static createFacultySchema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(200)
      .required()
      .messages({
        'string.empty': 'El nombre de la facultad es requerido',
        'string.min': 'El nombre debe tener al menos 3 caracteres',
        'string.max': 'El nombre no puede exceder 200 caracteres'
      }),

    code: Joi.string()
      .min(2)
      .max(20)
      .uppercase()
      .required()
      .messages({
        'string.empty': 'El código de la facultad es requerido',
        'string.min': 'El código debe tener al menos 2 caracteres',
        'string.max': 'El código no puede exceder 20 caracteres'
      }),

    description: Joi.string()
      .max(1000)
      .optional(),

    dean: Joi.string()
      .max(100)
      .optional(),

    website: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'El sitio web debe tener un formato de URL válido'
      }),

    email: Joi.string()
      .email()
      .optional()
      .messages({
        'string.email': 'El email debe tener un formato válido'
      }),

    phone: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'El teléfono debe tener un formato válido'
      }),

    metadata: Joi.object().optional()
  });

  // Validation schema for updating faculty
  static updateFacultySchema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(200)
      .optional(),

    code: Joi.string()
      .min(2)
      .max(20)
      .uppercase()
      .optional(),

    description: Joi.string()
      .max(1000)
      .optional(),

    dean: Joi.string()
      .max(100)
      .optional(),

    website: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'El sitio web debe tener un formato de URL válido'
      }),

    email: Joi.string()
      .email()
      .optional()
      .messages({
        'string.email': 'El email debe tener un formato válido'
      }),

    phone: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'El teléfono debe tener un formato válido'
      }),

    status: Joi.string()
      .valid('active', 'inactive')
      .optional(),

    metadata: Joi.object().optional()
  });

  // Validation schema for query parameters
  static querySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().max(200).optional(),
    status: Joi.string().valid('active', 'inactive', 'all').default('active')
  });

  // Validate faculty creation data
  static validateCreate(facultyData) {
    const { error, value } = this.createFacultySchema.validate(facultyData, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return value;
  }

  // Validate faculty update data
  static validateUpdate(facultyData) {
    const { error, value } = this.updateFacultySchema.validate(facultyData, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return value;
  }

  // Validate query parameters
  static validateQuery(queryParams) {
    const { error, value } = this.querySchema.validate(queryParams, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return value;
  }
}

export default FacultyValidator;