// 🔍 Academic Period Validation Strategy - Input Validation Layer
// Following Strategy Pattern and Open/Closed Principle

import Joi from 'joi';

class AcademicPeriodValidationStrategy {
  // Validation schema for creating academic periods
  static createAcademicPeriodSchema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.empty': 'El nombre del período académico es requerido',
        'string.min': 'El nombre debe tener al menos 3 caracteres',
        'string.max': 'El nombre no puede exceder 100 caracteres',
        'any.required': 'El nombre del período académico es requerido'
      }),

    code: Joi.string()
      .min(2)
      .max(20)
      .required()
      .pattern(/^[A-Z0-9-_]+$/)
      .messages({
        'string.empty': 'El código del período académico es requerido',
        'string.min': 'El código debe tener al menos 2 caracteres',
        'string.max': 'El código no puede exceder 20 caracteres',
        'string.pattern.base': 'El código debe contener solo letras mayúsculas, números, guiones y guiones bajos',
        'any.required': 'El código del período académico es requerido'
      }),

    type: Joi.string()
      .valid('semestre', 'trimestre', 'cuatrimestre', 'anual')
      .required()
      .messages({
        'any.only': 'El tipo debe ser: semestre, trimestre, cuatrimestre, anual',
        'any.required': 'El tipo de período académico es requerido'
      }),

    year: Joi.number()
      .integer()
      .min(2020)
      .max(2050)
      .required()
      .messages({
        'number.base': 'El año debe ser un número',
        'number.integer': 'El año debe ser un número entero',
        'number.min': 'El año debe ser mayor a 2019',
        'number.max': 'El año no puede ser mayor a 2050',
        'any.required': 'El año es requerido'
      }),

    start_date: Joi.date()
      .iso()
      .required()
      .messages({
        'date.base': 'La fecha de inicio debe ser una fecha válida',
        'date.format': 'La fecha de inicio debe estar en formato ISO',
        'any.required': 'La fecha de inicio es requerida'
      }),

    end_date: Joi.date()
      .iso()
      .greater(Joi.ref('start_date'))
      .required()
      .messages({
        'date.base': 'La fecha de fin debe ser una fecha válida',
        'date.format': 'La fecha de fin debe estar en formato ISO',
        'date.greater': 'La fecha de fin debe ser posterior a la fecha de inicio',
        'any.required': 'La fecha de fin es requerida'
      }),

    enrollment_start_date: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.base': 'La fecha de inicio de inscripción debe ser una fecha válida',
        'date.format': 'La fecha de inicio de inscripción debe estar en formato ISO'
      }),

    enrollment_end_date: Joi.date()
      .iso()
      .greater(Joi.ref('enrollment_start_date'))
      .when('enrollment_start_date', {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'date.base': 'La fecha de fin de inscripción debe ser una fecha válida',
        'date.format': 'La fecha de fin de inscripción debe estar en formato ISO',
        'date.greater': 'La fecha de fin de inscripción debe ser posterior a la fecha de inicio de inscripción',
        'any.required': 'La fecha de fin de inscripción es requerida cuando se especifica fecha de inicio'
      }),

    description: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'La descripción no puede exceder 500 caracteres'
      }),

    status: Joi.string()
      .valid('active', 'inactive', 'upcoming', 'completed')
      .default('active')
      .messages({
        'any.only': 'El estado debe ser: active, inactive, upcoming, completed'
      }),

    is_current: Joi.boolean()
      .default(false)
      .messages({
        'boolean.base': 'is_current debe ser un valor booleano'
      }),

    settings: Joi.object()
      .optional()
      .messages({
        'object.base': 'Los ajustes deben ser un objeto válido'
      })
  });

  // Validation schema for updating academic periods
  static updateAcademicPeriodSchema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(100)
      .optional()
      .messages({
        'string.min': 'El nombre debe tener al menos 3 caracteres',
        'string.max': 'El nombre no puede exceder 100 caracteres'
      }),

    code: Joi.string()
      .min(2)
      .max(20)
      .optional()
      .pattern(/^[A-Z0-9-_]+$/)
      .messages({
        'string.min': 'El código debe tener al menos 2 caracteres',
        'string.max': 'El código no puede exceder 20 caracteres',
        'string.pattern.base': 'El código debe contener solo letras mayúsculas, números, guiones y guiones bajos'
      }),

    type: Joi.string()
      .valid('semestre', 'trimestre', 'cuatrimestre', 'anual')
      .optional()
      .messages({
        'any.only': 'El tipo debe ser: semestre, trimestre, cuatrimestre, anual'
      }),

    year: Joi.number()
      .integer()
      .min(2020)
      .max(2050)
      .optional()
      .messages({
        'number.base': 'El año debe ser un número',
        'number.integer': 'El año debe ser un número entero',
        'number.min': 'El año debe ser mayor a 2019',
        'number.max': 'El año no puede ser mayor a 2050'
      }),

    start_date: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.base': 'La fecha de inicio debe ser una fecha válida',
        'date.format': 'La fecha de inicio debe estar en formato ISO'
      }),

    end_date: Joi.date()
      .iso()
      .greater(Joi.ref('start_date'))
      .optional()
      .messages({
        'date.base': 'La fecha de fin debe ser una fecha válida',
        'date.format': 'La fecha de fin debe estar en formato ISO',
        'date.greater': 'La fecha de fin debe ser posterior a la fecha de inicio'
      }),

    enrollment_start_date: Joi.date()
      .iso()
      .optional()
      .allow(null)
      .messages({
        'date.base': 'La fecha de inicio de inscripción debe ser una fecha válida',
        'date.format': 'La fecha de inicio de inscripción debe estar en formato ISO'
      }),

    enrollment_end_date: Joi.date()
      .iso()
      .optional()
      .allow(null)
      .messages({
        'date.base': 'La fecha de fin de inscripción debe ser una fecha válida',
        'date.format': 'La fecha de fin de inscripción debe estar en formato ISO'
      }),

    description: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'La descripción no puede exceder 500 caracteres'
      }),

    status: Joi.string()
      .valid('active', 'inactive', 'upcoming', 'completed')
      .optional()
      .messages({
        'any.only': 'El estado debe ser: active, inactive, upcoming, completed'
      }),

    is_current: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'is_current debe ser un valor booleano'
      }),

    settings: Joi.object()
      .optional()
      .messages({
        'object.base': 'Los ajustes deben ser un objeto válido'
      })
  });

  // Validation schema for academic period filters
  static academicPeriodFiltersSchema = Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.min': 'La página debe ser mayor a 0',
        'number.integer': 'La página debe ser un número entero'
      }),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.min': 'El límite debe ser mayor a 0',
        'number.max': 'El límite no puede ser mayor a 100',
        'number.integer': 'El límite debe ser un número entero'
      }),

    search: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': 'El término de búsqueda no puede exceder 200 caracteres'
      }),

    type: Joi.string()
      .valid('semestre', 'trimestre', 'cuatrimestre', 'anual')
      .optional()
      .messages({
        'any.only': 'El tipo debe ser: semestre, trimestre, cuatrimestre, anual'
      }),

    year: Joi.number()
      .integer()
      .min(2020)
      .max(2050)
      .optional()
      .messages({
        'number.base': 'El año debe ser un número',
        'number.integer': 'El año debe ser un número entero',
        'number.min': 'El año debe ser mayor a 2019',
        'number.max': 'El año no puede ser mayor a 2050'
      }),

    status: Joi.string()
      .valid('active', 'inactive', 'upcoming', 'completed')
      .optional()
      .messages({
        'any.only': 'El estado debe ser: active, inactive, upcoming, completed'
      }),

    is_current: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'is_current debe ser un valor booleano'
      }),

    sortBy: Joi.string()
      .valid('name', 'code', 'type', 'year', 'start_date', 'end_date', 'created_at')
      .default('start_date')
      .messages({
        'any.only': 'El campo de ordenamiento debe ser: name, code, type, year, start_date, end_date, created_at'
      }),

    sortOrder: Joi.string()
      .valid('ASC', 'DESC')
      .default('DESC')
      .messages({
        'any.only': 'El orden debe ser: ASC, DESC'
      })
  });
}

class AcademicPeriodValidator {
  // Validate academic period creation data
  static validateCreateAcademicPeriod(data) {
    const { error, value } = AcademicPeriodValidationStrategy.createAcademicPeriodSchema.validate(data, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
    
    return value;
  }

  // Validate academic period update data
  static validateUpdateAcademicPeriod(data) {
    const { error, value } = AcademicPeriodValidationStrategy.updateAcademicPeriodSchema.validate(data, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
    
    return value;
  }

  // Validate filters
  static validateFilters(data) {
    const { error, value } = AcademicPeriodValidationStrategy.academicPeriodFiltersSchema.validate(data);
    
    if (error) {
      throw new Error(`Filter validation failed: ${error.details[0].message}`);
    }
    
    return value;
  }

  // Validate academic period ID
  static validateAcademicPeriodId(id) {
    if (!id) {
      throw new Error('El ID del período académico es requerido');
    }

    const { error } = Joi.string().uuid().validate(id);
    if (error) {
      throw new Error('El ID del período académico debe ser un UUID válido');
    }

    return id;
  }
}

export default AcademicPeriodValidator;