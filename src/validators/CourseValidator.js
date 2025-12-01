// 🔍 Course Validation Strategy - Input Validation Layer
// Following Strategy Pattern and Open/Closed Principle

import Joi from 'joi';

class CourseValidationStrategy {
  // Validation schema for creating courses
  static createCourseSchema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(200)
      .required()
      .messages({
        'string.empty': 'El nombre del curso es requerido',
        'string.min': 'El nombre debe tener al menos 3 caracteres',
        'string.max': 'El nombre no puede exceder 200 caracteres',
        'any.required': 'El nombre del curso es requerido'
      }),

    code: Joi.string()
      .min(3)
      .max(20)
      .required()
      .pattern(/^[A-Z0-9-_]+$/)
      .messages({
        'string.empty': 'El código del curso es requerido',
        'string.min': 'El código debe tener al menos 3 caracteres',
        'string.max': 'El código no puede exceder 20 caracteres',
        'string.pattern.base': 'El código debe contener solo letras mayúsculas, números, guiones y guiones bajos',
        'any.required': 'El código del curso es requerido'
      }),

    description: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'La descripción no puede exceder 1000 caracteres'
      }),

    semester: Joi.number()
      .integer()
      .min(1)
      .max(12)
      .required()
      .messages({
        'number.base': 'El semestre debe ser un número',
        'number.integer': 'El semestre debe ser un número entero',
        'number.min': 'El semestre debe ser mayor a 0',
        'number.max': 'El semestre no puede ser mayor a 12',
        'any.required': 'El semestre es requerido'
      }),

    credits: Joi.number()
      .integer()
      .min(1)
      .max(20)
      .required()
      .messages({
        'number.base': 'Los créditos deben ser un número',
        'number.integer': 'Los créditos deben ser un número entero',
        'number.min': 'Los créditos deben ser mayor a 0',
        'number.max': 'Los créditos no pueden ser mayor a 20',
        'any.required': 'Los créditos son requeridos'
      }),

    course_type: Joi.string()
      .valid('obligatorio', 'electivo', 'practica', 'seminario')
      .required()
      .messages({
        'any.only': 'El tipo de curso debe ser: obligatorio, electivo, practica, seminario',
        'any.required': 'El tipo de curso es requerido'
      }),

    career_id: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.empty': 'El ID de la carrera es requerido',
        'string.guid': 'El ID de la carrera debe ser un UUID válido',
        'any.required': 'El ID de la carrera es requerido'
      }),

    teacher_id: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'El ID del profesor debe ser un UUID válido'
      }),

    academic_period_id: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'El ID del período académico debe ser un UUID válido'
      }),

    status: Joi.string()
      .valid('active', 'inactive', 'suspended')
      .default('active')
      .messages({
        'any.only': 'El estado debe ser: active, inactive, suspended'
      })
  });

  // Validation schema for updating courses
  static updateCourseSchema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(200)
      .optional()
      .messages({
        'string.min': 'El nombre debe tener al menos 3 caracteres',
        'string.max': 'El nombre no puede exceder 200 caracteres'
      }),

    code: Joi.string()
      .min(3)
      .max(20)
      .optional()
      .pattern(/^[A-Z0-9-_]+$/)
      .messages({
        'string.min': 'El código debe tener al menos 3 caracteres',
        'string.max': 'El código no puede exceder 20 caracteres',
        'string.pattern.base': 'El código debe contener solo letras mayúsculas, números, guiones y guiones bajos'
      }),

    description: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'La descripción no puede exceder 1000 caracteres'
      }),

    semester: Joi.number()
      .integer()
      .min(1)
      .max(12)
      .optional()
      .messages({
        'number.base': 'El semestre debe ser un número',
        'number.integer': 'El semestre debe ser un número entero',
        'number.min': 'El semestre debe ser mayor a 0',
        'number.max': 'El semestre no puede ser mayor a 12'
      }),

    credits: Joi.number()
      .integer()
      .min(1)
      .max(20)
      .optional()
      .messages({
        'number.base': 'Los créditos deben ser un número',
        'number.integer': 'Los créditos deben ser un número entero',
        'number.min': 'Los créditos deben ser mayor a 0',
        'number.max': 'Los créditos no pueden ser mayor a 20'
      }),

    course_type: Joi.string()
      .valid('obligatorio', 'electivo', 'practica', 'seminario')
      .optional()
      .messages({
        'any.only': 'El tipo de curso debe ser: obligatorio, electivo, practica, seminario'
      }),

    career_id: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'El ID de la carrera debe ser un UUID válido'
      }),

    teacher_id: Joi.string()
      .uuid()
      .optional()
      .allow(null)
      .messages({
        'string.guid': 'El ID del profesor debe ser un UUID válido'
      }),

    academic_period_id: Joi.string()
      .uuid()
      .optional()
      .allow(null)
      .messages({
        'string.guid': 'El ID del período académico debe ser un UUID válido'
      }),

    status: Joi.string()
      .valid('active', 'inactive', 'suspended')
      .optional()
      .messages({
        'any.only': 'El estado debe ser: active, inactive, suspended'
      })
  });

  // Validation schema for course filters
  static courseFiltersSchema = Joi.object({
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

    career_id: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'El ID de la carrera debe ser un UUID válido'
      }),

    semester: Joi.number()
      .integer()
      .min(1)
      .max(12)
      .optional()
      .messages({
        'number.integer': 'El semestre debe ser un número entero',
        'number.min': 'El semestre debe ser mayor a 0',
        'number.max': 'El semestre no puede ser mayor a 12'
      }),

    course_type: Joi.string()
      .valid('obligatorio', 'electivo', 'practica', 'seminario')
      .optional()
      .messages({
        'any.only': 'El tipo de curso debe ser: obligatorio, electivo, practica, seminario'
      }),

    status: Joi.string()
      .valid('active', 'inactive', 'suspended')
      .optional()
      .messages({
        'any.only': 'El estado debe ser: active, inactive, suspended'
      }),

    sortBy: Joi.string()
      .valid('name', 'code', 'semester', 'credits', 'created_at')
      .default('name')
      .messages({
        'any.only': 'El campo de ordenamiento debe ser: name, code, semester, credits, created_at'
      }),

    sortOrder: Joi.string()
      .valid('ASC', 'DESC')
      .default('ASC')
      .messages({
        'any.only': 'El orden debe ser: ASC, DESC'
      })
  });
}

class CourseValidator {
  // Validate course creation data
  static validateCreateCourse(data) {
    const { error, value } = CourseValidationStrategy.createCourseSchema.validate(data, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
    
    return value;
  }

  // Validate course update data
  static validateUpdateCourse(data) {
    const { error, value } = CourseValidationStrategy.updateCourseSchema.validate(data, { abortEarly: false });
    
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
    const { error, value } = CourseValidationStrategy.courseFiltersSchema.validate(data);
    
    if (error) {
      throw new Error(`Filter validation failed: ${error.details[0].message}`);
    }
    
    return value;
  }

  // Validate course ID
  static validateCourseId(id) {
    if (!id) {
      throw new Error('El ID del curso es requerido');
    }

    const { error } = Joi.string().uuid().validate(id);
    if (error) {
      throw new Error('El ID del curso debe ser un UUID válido');
    }

    return id;
  }
}

export default CourseValidator;