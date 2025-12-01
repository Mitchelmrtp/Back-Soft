// 🚨 Report Validator - Input Validation for Report Operations
// Following Single Responsibility Principle and Input Validation

import Joi from 'joi';

/**
 * Validate report creation data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateReport = (req, res, next) => {
  const schema = Joi.object({
    resource_id: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.base': 'El ID del recurso debe ser un string válido',
        'string.uuid': 'El ID del recurso debe ser un UUID válido',
        'any.required': 'El ID del recurso es obligatorio'
      }),

    type: Joi.string()
      .valid(
        'inappropriate_content',
        'copyright_violation',
        'spam',
        'misleading_title',
        'wrong_category',
        'broken_file',
        'other'
      )
      .required()
      .messages({
        'any.only': 'Tipo de reporte inválido',
        'any.required': 'El tipo de reporte es obligatorio'
      }),

    reason: Joi.string()
      .min(10)
      .max(1000)
      .trim()
      .required()
      .messages({
        'string.min': 'La razón debe tener al menos 10 caracteres',
        'string.max': 'La razón no puede exceder 1000 caracteres',
        'any.required': 'La razón del reporte es obligatoria'
      }),

    additional_info: Joi.string()
      .max(2000)
      .trim()
      .allow('')
      .optional()
      .messages({
        'string.max': 'La información adicional no puede exceder 2000 caracteres'
      })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }

  next();
};

/**
 * Validate report status update data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateReportStatusUpdate = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid('pending', 'reviewing', 'resolved', 'dismissed')
      .required()
      .messages({
        'any.only': 'Estado inválido',
        'any.required': 'El estado es obligatorio'
      }),

    resolution_notes: Joi.string()
      .max(1000)
      .trim()
      .when('status', {
        is: 'resolved',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'string.max': 'Las notas de resolución no pueden exceder 1000 caracteres',
        'any.required': 'Las notas de resolución son obligatorias al resolver un reporte'
      }),

    action_taken: Joi.string()
      .valid(
        'no_action',
        'warning_issued',
        'content_removed',
        'user_suspended',
        'content_modified',
        'category_changed'
      )
      .when('status', {
        is: 'resolved',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'any.only': 'Acción tomada inválida',
        'any.required': 'La acción tomada es obligatoria al resolver un reporte'
      })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }

  next();
};

/**
 * Validate pagination and filter parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateReportQuery = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'La página debe ser un número',
        'number.integer': 'La página debe ser un número entero',
        'number.min': 'La página debe ser mayor a 0'
      }),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .messages({
        'number.base': 'El límite debe ser un número',
        'number.integer': 'El límite debe ser un número entero',
        'number.min': 'El límite debe ser mayor a 0',
        'number.max': 'El límite no puede ser mayor a 100'
      }),

    status: Joi.string()
      .valid('pending', 'reviewing', 'resolved', 'dismissed')
      .optional()
      .messages({
        'any.only': 'Estado inválido'
      }),

    type: Joi.string()
      .valid(
        'inappropriate_content',
        'copyright_violation',
        'spam',
        'misleading_title',
        'wrong_category',
        'broken_file',
        'other'
      )
      .optional()
      .messages({
        'any.only': 'Tipo de reporte inválido'
      }),

    priority: Joi.string()
      .valid('low', 'medium', 'high', 'urgent')
      .optional()
      .messages({
        'any.only': 'Prioridad inválida'
      }),

    search: Joi.string()
      .max(100)
      .trim()
      .optional()
      .messages({
        'string.max': 'La búsqueda no puede exceder 100 caracteres'
      }),

    start_date: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'La fecha de inicio debe ser una fecha válida ISO'
      }),

    end_date: Joi.date()
      .iso()
      .min(Joi.ref('start_date'))
      .optional()
      .messages({
        'date.format': 'La fecha de fin debe ser una fecha válida ISO',
        'date.min': 'La fecha de fin debe ser posterior a la fecha de inicio'
      })
  });

  const { error, value } = schema.validate(req.query);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Parámetros de consulta inválidos',
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }

  // Update query with validated values
  req.query = value;
  next();
};