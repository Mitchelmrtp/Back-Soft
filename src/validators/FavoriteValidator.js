// 🔍 Favorite Validation Strategy - Input Validation Layer
// Following Strategy Pattern and Open/Closed Principle

import Joi from 'joi';

class FavoriteValidationStrategy {
  // Validation schema for adding favorites
  static addFavoriteSchema = Joi.object({
    resource_id: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.empty': 'El ID del recurso es requerido',
        'string.guid': 'El ID del recurso debe ser un UUID válido',
        'any.required': 'El ID del recurso es requerido'
      })
  });

  // Validation schema for favorite filters
  static favoriteFiltersSchema = Joi.object({
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

    sortBy: Joi.string()
      .valid('created_at', 'title', 'views_count', 'downloads_count', 'rating_average')
      .default('created_at')
      .messages({
        'any.only': 'El campo de ordenamiento debe ser: created_at, title, views_count, downloads_count, rating_average'
      }),

    sortOrder: Joi.string()
      .valid('ASC', 'DESC')
      .default('DESC')
      .messages({
        'any.only': 'El orden debe ser: ASC o DESC'
      }),

    category_id: Joi.string()
      .uuid()
      .allow(null, '')
      .messages({
        'string.guid': 'El ID de categoría debe ser un UUID válido'
      }),

    type: Joi.string()
      .valid('document', 'video', 'image', 'audio', 'link', 'other')
      .allow(null, '')
      .messages({
        'any.only': 'El tipo debe ser: document, video, image, audio, link, other'
      }),

    format: Joi.string()
      .max(50)
      .allow(null, '')
      .messages({
        'string.max': 'El formato no puede exceder 50 caracteres'
      })
  });
}

class FavoriteValidator {
  // 🔍 Validate add favorite request
  static validateAddFavorite(data) {
    const { error, value } = FavoriteValidationStrategy.addFavoriteSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new Error(`Validation error: ${errorMessage}`);
    }

    return value;
  }

  // 📊 Validate favorite filters
  static validateFavoriteFilters(filters) {
    const { error, value } = FavoriteValidationStrategy.favoriteFiltersSchema.validate(filters, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new Error(`Filter validation error: ${errorMessage}`);
    }

    return value;
  }

  // 🆔 Validate UUID parameters
  static validateUUID(id, fieldName = 'ID') {
    const schema = Joi.string().uuid().required();
    const { error } = schema.validate(id);

    if (error) {
      throw new Error(`${fieldName} debe ser un UUID válido`);
    }

    return id;
  }

  // 👤 Validate user ID
  static validateUserId(userId) {
    return this.validateUUID(userId, 'User ID');
  }

  // 📚 Validate resource ID
  static validateResourceId(resourceId) {
    return this.validateUUID(resourceId, 'Resource ID');
  }
}

export default FavoriteValidator;