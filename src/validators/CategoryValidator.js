import Joi from 'joi';

/**
 * Validadores para Category
 * Implementa el principio de Single Responsibility
 * Centraliza la lógica de validación
 */

// Schema para crear categoría
const createCategorySchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'any.required': 'El nombre es requerido'
    }),
  
  description: Joi.string()
    .allow('')
    .max(1000)
    .optional()
    .messages({
      'string.max': 'La descripción no puede exceder 1000 caracteres'
    }),
  
  color: Joi.string()
    .pattern(/^#[0-9A-F]{6}$/i)
    .optional()
    .messages({
      'string.pattern.base': 'El color debe ser un código hexadecimal válido (ej: #FF0000)'
    }),
  
  icon: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'El icono no puede exceder 50 caracteres'
    }),
  
  image_url: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'La URL de imagen debe ser válida'
    }),
  
  parent_id: Joi.string()
    .uuid()
    .optional()
    .allow(null)
    .messages({
      'string.uuid': 'El ID de categoría padre debe ser un UUID válido'
    }),
  
  sort_order: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.integer': 'El orden debe ser un número entero',
      'number.min': 'El orden debe ser mayor o igual a 0'
    }),
  
  status: Joi.string()
    .valid('active', 'inactive')
    .optional()
    .messages({
      'any.only': 'El estado debe ser "active" o "inactive"'
    })
});

// Schema para actualizar categoría
const updateCategorySchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'El nombre no puede estar vacío',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres'
    }),
  
  description: Joi.string()
    .allow('')
    .max(1000)
    .optional()
    .messages({
      'string.max': 'La descripción no puede exceder 1000 caracteres'
    }),
  
  color: Joi.string()
    .pattern(/^#[0-9A-F]{6}$/i)
    .optional()
    .messages({
      'string.pattern.base': 'El color debe ser un código hexadecimal válido (ej: #FF0000)'
    }),
  
  icon: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'El icono no puede exceder 50 caracteres'
    }),
  
  image_url: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'La URL de imagen debe ser válida'
    }),
  
  parent_id: Joi.string()
    .uuid()
    .optional()
    .allow(null)
    .messages({
      'string.uuid': 'El ID de categoría padre debe ser un UUID válido'
    }),
  
  sort_order: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.integer': 'El orden debe ser un número entero',
      'number.min': 'El orden debe ser mayor o igual a 0'
    }),
  
  status: Joi.string()
    .valid('active', 'inactive')
    .optional()
    .messages({
      'any.only': 'El estado debe ser "active" o "inactive"'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

// Schema para filtros de consulta
const queryFiltersSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.integer': 'La página debe ser un número entero',
      'number.min': 'La página debe ser mayor a 0'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'number.integer': 'El límite debe ser un número entero',
      'number.min': 'El límite debe ser mayor a 0',
      'number.max': 'El límite no puede exceder 100'
    }),
  
  status: Joi.string()
    .valid('active', 'inactive')
    .optional()
    .messages({
      'any.only': 'El estado debe ser "active" o "inactive"'
    }),
  
  parent_id: Joi.string()
    .uuid()
    .optional()
    .allow(null, '')
    .messages({
      'string.uuid': 'El ID de categoría padre debe ser un UUID válido'
    }),
  
  level: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.integer': 'El nivel debe ser un número entero',
      'number.min': 'El nivel debe ser mayor o igual a 0'
    }),
  
  search: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'La búsqueda debe tener al menos 1 caracter',
      'string.max': 'La búsqueda no puede exceder 100 caracteres'
    }),
  
  orderBy: Joi.string()
    .valid('name', 'created_at', 'updated_at', 'sort_order', 'level')
    .optional()
    .messages({
      'any.only': 'El campo de ordenamiento no es válido'
    }),
  
  orderDirection: Joi.string()
    .valid('ASC', 'DESC', 'asc', 'desc')
    .optional()
    .messages({
      'any.only': 'La dirección de ordenamiento debe ser ASC o DESC'
    }),
  
  includeTree: Joi.boolean()
    .optional()
});

/**
 * Valida los datos para crear una categoría
 * @param {Object} data - Datos a validar
 * @returns {Object} Resultado de la validación
 */
export const validateCategoryData = (data) => {
  const { error, value } = createCategorySchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));

    return {
      isValid: false,
      errors,
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value
  };
};

/**
 * Valida los datos para actualizar una categoría
 * @param {Object} data - Datos a validar
 * @returns {Object} Resultado de la validación
 */
export const validateUpdateCategoryData = (data) => {
  const { error, value } = updateCategorySchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));

    return {
      isValid: false,
      errors,
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value
  };
};

/**
 * Valida los filtros de consulta
 * @param {Object} query - Query parameters a validar
 * @returns {Object} Resultado de la validación
 */
export const validateQueryFilters = (query) => {
  const { error, value } = queryFiltersSchema.validate(query, { 
    abortEarly: false,
    stripUnknown: true 
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));

    return {
      isValid: false,
      errors,
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value
  };
};

/**
 * Valida que un ID sea un UUID válido
 * @param {string} id - ID a validar
 * @returns {Object} Resultado de la validación
 */
export const validateUUID = (id) => {
  const schema = Joi.string().uuid().required();
  const { error } = schema.validate(id);

  return {
    isValid: !error,
    error: error ? error.message : null
  };
};

export {
  createCategorySchema,
  updateCategorySchema,
  queryFiltersSchema
};