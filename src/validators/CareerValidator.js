// 🔍 Career Validation Strategy - Input Validation Layer
// Following Strategy Pattern and Open/Closed Principle

import Joi from 'joi';

class CareerValidationStrategy {
  // Validation schema for creating careers
  static createCareerSchema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(200)
      .required()
      .messages({
        'string.empty': 'El nombre de la carrera es requerido',
        'string.min': 'El nombre debe tener al menos 3 caracteres',
        'string.max': 'El nombre no puede exceder 200 caracteres',
        'any.required': 'El nombre de la carrera es requerido'
      }),

    code: Joi.string()
      .min(2)
      .max(15)
      .required()
      .pattern(/^[A-Z0-9-_]+$/)
      .messages({
        'string.empty': 'El código de la carrera es requerido',
        'string.min': 'El código debe tener al menos 2 caracteres',
        'string.max': 'El código no puede exceder 15 caracteres',
        'string.pattern.base': 'El código debe contener solo letras mayúsculas, números, guiones y guiones bajos',
        'any.required': 'El código de la carrera es requerido'
      }),

    description: Joi.string()
      .max(2000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'La descripción no puede exceder 2000 caracteres'
      }),

    degree_type: Joi.string()
      .valid('licenciatura', 'ingenieria', 'maestria', 'doctorado', 'tecnico')
      .required()
      .messages({
        'any.only': 'El tipo de grado debe ser: licenciatura, ingenieria, maestria, doctorado, tecnico',
        'any.required': 'El tipo de grado es requerido'
      }),

    duration_years: Joi.number()
      .integer()
      .min(1)
      .max(12)
      .required()
      .messages({
        'number.base': 'La duración debe ser un número',
        'number.integer': 'La duración debe ser un número entero',
        'number.min': 'La duración debe ser mayor a 0 años',
        'number.max': 'La duración no puede ser mayor a 12 años',
        'any.required': 'La duración en años es requerida'
      }),

    total_credits: Joi.number()
      .integer()
      .min(1)
      .max(500)
      .optional()
      .messages({
        'number.base': 'Los créditos totales deben ser un número',
        'number.integer': 'Los créditos totales deben ser un número entero',
        'number.min': 'Los créditos totales deben ser mayor a 0',
        'number.max': 'Los créditos totales no pueden ser mayor a 500'
      }),

    faculty_id: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.empty': 'El ID de la facultad es requerido',
        'string.guid': 'El ID de la facultad debe ser un UUID válido',
        'any.required': 'El ID de la facultad es requerido'
      }),

    coordinator_id: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'El ID del coordinador debe ser un UUID válido'
      }),

    status: Joi.string()
      .valid('active', 'inactive', 'suspended')
      .default('active')
      .messages({
        'any.only': 'El estado debe ser: active, inactive, suspended'
      }),

    accreditation_info: Joi.object()
      .optional()
      .messages({
        'object.base': 'La información de acreditación debe ser un objeto válido'
      })
  });

  // Validation schema for updating careers
  static updateCareerSchema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(200)
      .optional()
      .messages({
        'string.min': 'El nombre debe tener al menos 3 caracteres',
        'string.max': 'El nombre no puede exceder 200 caracteres'
      }),

    code: Joi.string()
      .min(2)
      .max(15)
      .optional()
      .pattern(/^[A-Z0-9-_]+$/)
      .messages({
        'string.min': 'El código debe tener al menos 2 caracteres',
        'string.max': 'El código no puede exceder 15 caracteres',
        'string.pattern.base': 'El código debe contener solo letras mayúsculas, números, guiones y guiones bajos'
      }),

    description: Joi.string()
      .max(2000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'La descripción no puede exceder 2000 caracteres'
      }),

    degree_type: Joi.string()
      .valid('licenciatura', 'ingenieria', 'maestria', 'doctorado', 'tecnico')
      .optional()
      .messages({
        'any.only': 'El tipo de grado debe ser: licenciatura, ingenieria, maestria, doctorado, tecnico'
      }),

    duration_years: Joi.number()
      .integer()
      .min(1)
      .max(12)
      .optional()
      .messages({
        'number.base': 'La duración debe ser un número',
        'number.integer': 'La duración debe ser un número entero',
        'number.min': 'La duración debe ser mayor a 0 años',
        'number.max': 'La duración no puede ser mayor a 12 años'
      }),

    total_credits: Joi.number()
      .integer()
      .min(1)
      .max(500)
      .optional()
      .messages({
        'number.base': 'Los créditos totales deben ser un número',
        'number.integer': 'Los créditos totales deben ser un número entero',
        'number.min': 'Los créditos totales deben ser mayor a 0',
        'number.max': 'Los créditos totales no pueden ser mayor a 500'
      }),

    faculty_id: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'El ID de la facultad debe ser un UUID válido'
      }),

    coordinator_id: Joi.string()
      .uuid()
      .optional()
      .allow(null)
      .messages({
        'string.guid': 'El ID del coordinador debe ser un UUID válido'
      }),

    status: Joi.string()
      .valid('active', 'inactive', 'suspended')
      .optional()
      .messages({
        'any.only': 'El estado debe ser: active, inactive, suspended'
      }),

    accreditation_info: Joi.object()
      .optional()
      .messages({
        'object.base': 'La información de acreditación debe ser un objeto válido'
      })
  });

  // Validation schema for career filters
  static careerFiltersSchema = Joi.object({
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

    faculty_id: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'El ID de la facultad debe ser un UUID válido'
      }),

    degree_type: Joi.string()
      .valid('licenciatura', 'ingenieria', 'maestria', 'doctorado', 'tecnico')
      .optional()
      .messages({
        'any.only': 'El tipo de grado debe ser: licenciatura, ingenieria, maestria, doctorado, tecnico'
      }),

    status: Joi.string()
      .valid('active', 'inactive', 'suspended')
      .optional()
      .messages({
        'any.only': 'El estado debe ser: active, inactive, suspended'
      }),

    sortBy: Joi.string()
      .valid('name', 'code', 'degree_type', 'duration_years', 'created_at')
      .default('name')
      .messages({
        'any.only': 'El campo de ordenamiento debe ser: name, code, degree_type, duration_years, created_at'
      }),

    sortOrder: Joi.string()
      .valid('ASC', 'DESC')
      .default('ASC')
      .messages({
        'any.only': 'El orden debe ser: ASC, DESC'
      })
  });
}

class CareerValidator {
  // Validate career creation data
  static validateCreateCareer(data) {
    const { error, value } = CareerValidationStrategy.createCareerSchema.validate(data, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
    
    return value;
  }

  // Validate career update data
  static validateUpdateCareer(data) {
    const { error, value } = CareerValidationStrategy.updateCareerSchema.validate(data, { abortEarly: false });
    
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
    const { error, value } = CareerValidationStrategy.careerFiltersSchema.validate(data);
    
    if (error) {
      throw new Error(`Filter validation failed: ${error.details[0].message}`);
    }
    
    return value;
  }

  // Validate career ID
  static validateCareerId(id) {
    if (!id) {
      throw new Error('El ID de la carrera es requerido');
    }

    const { error } = Joi.string().uuid().validate(id);
    if (error) {
      throw new Error('El ID de la carrera debe ser un UUID válido');
    }

    return id;
  }

  // Validate faculty ID
  static validateFacultyId(id) {
    if (!id) {
      throw new Error('El ID de la facultad es requerido');
    }

    const { error } = Joi.string().uuid().validate(id);
    if (error) {
      throw new Error('El ID de la facultad debe ser un UUID válido');
    }

    return id;
  }
}

export default CareerValidator;