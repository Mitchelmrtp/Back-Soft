// 🔍 Validation Strategy - Resource Validation Rules
// Following Strategy Pattern and Open/Closed Principle

import Joi from 'joi';

class ResourceValidationStrategy {
  // Validation schema for creating resources
  static createResourceSchema = Joi.object({
    title: Joi.string()
      .min(3)
      .max(200)
      .required()
      .messages({
        'string.empty': 'El título es requerido',
        'string.min': 'El título debe tener al menos 3 caracteres',
        'string.max': 'El título no puede exceder 200 caracteres'
      }),

    description: Joi.string()
      .min(10)
      .max(2000)
      .required()
      .messages({
        'string.empty': 'La descripción es requerida',
        'string.min': 'La descripción debe tener al menos 10 caracteres',
        'string.max': 'La descripción no puede exceder 2000 caracteres'
      }),

    content: Joi.string()
      .max(50000)
      .allow('')
      .messages({
        'string.max': 'El contenido no puede exceder 50000 caracteres'
      }),

    type: Joi.string()
      .valid('document', 'video', 'image', 'audio', 'link', 'other')
      .default('document')
      .messages({
        'any.only': 'El tipo debe ser: document, video, image, audio, link, other'
      }),

    category_id: Joi.string()
      .uuid()
      .allow(null)
      .messages({
        'string.guid': 'El ID de categoría debe ser un UUID válido'
      }),

    format: Joi.string()
      .max(50)
      .allow('')
      .messages({
        'string.max': 'El formato no puede exceder 50 caracteres'
      }),

    file_url: Joi.string()
      .allow('')
      .messages({
        'string.empty': 'La URL del archivo puede estar vacía'
      }),

    file_path: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'La ruta del archivo no puede exceder 500 caracteres'
      }),

    file_size: Joi.number()
      .integer()
      .min(0)
      .max(100000000) // 100MB
      .allow(null)
      .messages({
        'number.min': 'El tamaño del archivo no puede ser negativo',
        'number.max': 'El tamaño del archivo no puede exceder 100MB'
      }),

    thumbnail_url: Joi.string()
      .allow('', null)
      .messages({
        'string.empty': 'La URL de la miniatura puede estar vacía'
      }),

    status: Joi.string()
      .valid('draft', 'published', 'archived', 'under_review', 'rejected')
      .default('draft')
      .messages({
        'any.only': 'El estado debe ser: draft, published, archived, under_review, rejected'
      }),

    visibility: Joi.string()
      .valid('public', 'private', 'restricted')
      .default('public')
      .messages({
        'any.only': 'La visibilidad debe ser: public, private, restricted'
      }),

    tags: Joi.array()
      .items(Joi.string().max(50))
      .max(10)
      .default([])
      .messages({
        'array.max': 'No puedes tener más de 10 etiquetas',
        'string.max': 'Cada etiqueta no puede exceder 50 caracteres'
      }),

    metadata: Joi.object()
      .default({})
      .messages({
        'object.base': 'Los metadatos deben ser un objeto válido'
      }),

    featured: Joi.boolean()
      .default(false),

    // Academic-specific fields
    academic_year: Joi.number()
      .integer()
      .min(2020)
      .max(2050)
      .allow(null)
      .messages({
        'number.min': 'El año académico debe ser mayor a 2020',
        'number.max': 'El año académico debe ser menor a 2050'
      }),

    semester: Joi.number()
      .integer()
      .min(1)
      .max(12)
      .allow(null)
      .messages({
        'number.min': 'El semestre debe ser mayor a 0',
        'number.max': 'El semestre debe ser menor a 13'
      }),

    topic: Joi.string()
      .min(3)
      .max(200)
      .allow('', null)
      .messages({
        'string.min': 'El tópico debe tener al menos 3 caracteres',
        'string.max': 'El tópico no puede exceder 200 caracteres'
      }),

    course_id: Joi.string()
      .uuid()
      .allow(null)
      .messages({
        'string.guid': 'El ID del curso debe ser un UUID válido'
      }),

    faculty_id: Joi.string()
      .uuid()
      .allow(null)
      .messages({
        'string.guid': 'El ID de la facultad debe ser un UUID válido'
      }),

    career_id: Joi.string()
      .uuid()
      .allow(null)
      .messages({
        'string.guid': 'El ID de la carrera debe ser un UUID válido'
      }),

    language: Joi.string()
      .min(2)
      .max(5)
      .default('es')
      .messages({
        'string.min': 'El idioma debe tener al menos 2 caracteres',
        'string.max': 'El idioma no puede exceder 5 caracteres'
      })
  });

  // Validation schema for updating resources
  static updateResourceSchema = Joi.object({
    title: Joi.string()
      .min(3)
      .max(200)
      .messages({
        'string.min': 'El título debe tener al menos 3 caracteres',
        'string.max': 'El título no puede exceder 200 caracteres'
      }),

    description: Joi.string()
      .min(10)
      .max(2000)
      .messages({
        'string.min': 'La descripción debe tener al menos 10 caracteres',
        'string.max': 'La descripción no puede exceder 2000 caracteres'
      }),

    content: Joi.string()
      .max(50000)
      .allow('')
      .messages({
        'string.max': 'El contenido no puede exceder 50000 caracteres'
      }),

    type: Joi.string()
      .valid('document', 'video', 'image', 'audio', 'link', 'other')
      .messages({
        'any.only': 'El tipo debe ser: document, video, image, audio, link, other'
      }),

    category_id: Joi.string()
      .uuid()
      .allow(null)
      .messages({
        'string.guid': 'El ID de categoría debe ser un UUID válido'
      }),

    format: Joi.string()
      .max(50)
      .allow('')
      .messages({
        'string.max': 'El formato no puede exceder 50 caracteres'
      }),

    file_url: Joi.string()
      .allow('')
      .messages({
        'string.empty': 'La URL del archivo puede estar vacía'
      }),

    file_path: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'La ruta del archivo no puede exceder 500 caracteres'
      }),

    file_size: Joi.number()
      .integer()
      .min(0)
      .max(100000000)
      .allow(null)
      .messages({
        'number.min': 'El tamaño del archivo no puede ser negativo',
        'number.max': 'El tamaño del archivo no puede exceder 100MB'
      }),

    thumbnail_url: Joi.string()
      .allow('', null)
      .messages({
        'string.empty': 'La URL de la miniatura puede estar vacía'
      }),

    status: Joi.string()
      .valid('draft', 'published', 'archived', 'under_review', 'rejected')
      .messages({
        'any.only': 'El estado debe ser: draft, published, archived, under_review, rejected'
      }),

    visibility: Joi.string()
      .valid('public', 'private', 'restricted')
      .messages({
        'any.only': 'La visibilidad debe ser: public, private, restricted'
      }),

    tags: Joi.array()
      .items(Joi.string().max(50))
      .max(10)
      .messages({
        'array.max': 'No puedes tener más de 10 etiquetas',
        'string.max': 'Cada etiqueta no puede exceder 50 caracteres'
      }),

    metadata: Joi.object()
      .messages({
        'object.base': 'Los metadatos deben ser un objeto válido'
      }),

    featured: Joi.boolean(),

    // Academic-specific fields
    academic_year: Joi.number()
      .integer()
      .min(2020)
      .max(2050)
      .allow(null)
      .messages({
        'number.min': 'El año académico debe ser mayor a 2020',
        'number.max': 'El año académico debe ser menor a 2050'
      }),

    semester: Joi.number()
      .integer()
      .min(1)
      .max(12)
      .allow(null)
      .messages({
        'number.min': 'El semestre debe ser mayor a 0',
        'number.max': 'El semestre debe ser menor a 13'
      }),

    topic: Joi.string()
      .min(3)
      .max(200)
      .allow('', null)
      .messages({
        'string.min': 'El tópico debe tener al menos 3 caracteres',
        'string.max': 'El tópico no puede exceder 200 caracteres'
      }),

    course_id: Joi.string()
      .uuid()
      .allow(null)
      .messages({
        'string.guid': 'El ID del curso debe ser un UUID válido'
      }),

    faculty_id: Joi.string()
      .uuid()
      .allow(null)
      .messages({
        'string.guid': 'El ID de la facultad debe ser un UUID válido'
      }),

    career_id: Joi.string()
      .uuid()
      .allow(null)
      .messages({
        'string.guid': 'El ID de la carrera debe ser un UUID válido'
      }),

    language: Joi.string()
      .min(2)
      .max(5)
      .messages({
        'string.min': 'El idioma debe tener al menos 2 caracteres',
        'string.max': 'El idioma no puede exceder 5 caracteres'
      })
  });

  // Validation schema for query filters
  static queryFiltersSchema = Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20),

    category_id: Joi.string()
      .uuid()
      .allow(''),

    type: Joi.string()
      .valid('document', 'video', 'image', 'audio', 'link', 'other')
      .allow(''),

    user_id: Joi.string()
      .uuid()
      .allow(''),

    search: Joi.string()
      .max(200)
      .allow(''),

    sort: Joi.string()
      .valid('created_at', 'updated_at', 'title', 'views_count', 'likes_count')
      .default('created_at'),

    order: Joi.string()
      .valid('ASC', 'DESC', 'asc', 'desc')
      .default('DESC'),

    status: Joi.string()
      .valid('draft', 'published', 'archived', 'under_review', 'rejected')
      .default('published')
  });

  // Validate resource creation data
  static validateCreate(data) {
    const { error, value } = this.createResourceSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => detail.message);
      throw new Error(`Validation error: ${messages.join(', ')}`);
    }

    return value;
  }

  // Validate resource update data
  static validateUpdate(data) {
    const { error, value } = this.updateResourceSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => detail.message);
      throw new Error(`Validation error: ${messages.join(', ')}`);
    }

    return value;
  }

  // Validate query filters
  static validateFilters(filters) {
    const { error, value } = this.queryFiltersSchema.validate(filters, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => detail.message);
      throw new Error(`Filter validation error: ${messages.join(', ')}`);
    }

    return value;
  }
}

export default ResourceValidationStrategy;