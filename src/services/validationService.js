import Joi from 'joi';

// User validation schemas
export const userValidation = {
    register: Joi.object({
        name: Joi.string()
            .min(2)
            .max(100)
            .required()
            .messages({
                'string.min': 'El nombre debe tener al menos 2 caracteres',
                'string.max': 'El nombre no puede tener más de 100 caracteres',
                'any.required': 'El nombre es requerido'
            }),
        
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Formato de email inválido',
                'any.required': 'El email es requerido'
            }),
        
        password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .required()
            .messages({
                'string.min': 'La contraseña debe tener al menos 8 caracteres',
                'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
                'any.required': 'La contraseña es requerida'
            }),
        
        first_name: Joi.string()
            .max(50)
            .optional(),
        
        last_name: Joi.string()
            .max(50)
            .optional(),
        
        role: Joi.string()
            .valid('user', 'moderator', 'admin')
            .default('user')
    }),

    login: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Formato de email inválido',
                'any.required': 'El email es requerido'
            }),
        
        password: Joi.string()
            .required()
            .messages({
                'any.required': 'La contraseña es requerida'
            })
    }),

    updateProfile: Joi.object({
        name: Joi.string()
            .min(2)
            .max(100)
            .optional(),
        
        first_name: Joi.string()
            .max(50)
            .optional(),
        
        last_name: Joi.string()
            .max(50)
            .optional(),
        
        bio: Joi.string()
            .max(500)
            .optional(),
        
        location: Joi.string()
            .max(100)
            .optional(),
        
        website: Joi.string()
            .uri()
            .optional(),
        
        phone: Joi.string()
            .pattern(/^\+?[\d\s-()]+$/)
            .optional()
    }),

    changePassword: Joi.object({
        currentPassword: Joi.string()
            .required()
            .messages({
                'any.required': 'La contraseña actual es requerida'
            }),
        
        newPassword: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .required()
            .messages({
                'string.min': 'La nueva contraseña debe tener al menos 8 caracteres',
                'string.pattern.base': 'La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número',
                'any.required': 'La nueva contraseña es requerida'
            })
    })
};

// Resource validation schemas
export const resourceValidation = {
    create: Joi.object({
        title: Joi.string()
            .min(3)
            .max(200)
            .required()
            .messages({
                'string.min': 'El título debe tener al menos 3 caracteres',
                'string.max': 'El título no puede tener más de 200 caracteres',
                'any.required': 'El título es requerido'
            }),
        
        description: Joi.string()
            .min(10)
            .max(1000)
            .required()
            .messages({
                'string.min': 'La descripción debe tener al menos 10 caracteres',
                'string.max': 'La descripción no puede tener más de 1000 caracteres',
                'any.required': 'La descripción es requerida'
            }),
        
        content: Joi.string()
            .min(10)
            .optional(),
        
        type: Joi.string()
            .valid('document', 'presentation', 'spreadsheet', 'image', 'video', 'audio', 'other')
            .required()
            .messages({
                'any.only': 'Tipo de recurso inválido',
                'any.required': 'El tipo de recurso es requerido'
            }),
        
        category_id: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
                'number.base': 'La categoría debe ser un número',
                'number.positive': 'ID de categoría inválido',
                'any.required': 'La categoría es requerida'
            }),
        
        target_audience: Joi.string()
            .max(200)
            .optional(),
        
        language: Joi.string()
            .length(2)
            .optional(),
        
        metadata: Joi.object()
            .optional()
    }),

    update: Joi.object({
        title: Joi.string()
            .min(3)
            .max(200)
            .optional(),
        
        description: Joi.string()
            .min(10)
            .max(1000)
            .optional(),
        
        content: Joi.string()
            .min(10)
            .optional(),
        
        type: Joi.string()
            .valid('document', 'presentation', 'spreadsheet', 'image', 'video', 'audio', 'other')
            .optional(),
        
        category_id: Joi.number()
            .integer()
            .positive()
            .optional(),
        
        target_audience: Joi.string()
            .max(200)
            .optional(),
        
        language: Joi.string()
            .length(2)
            .optional(),
        
        metadata: Joi.object()
            .optional()
    })
};

// Category validation schemas
export const categoryValidation = {
    create: Joi.object({
        name: Joi.string()
            .min(2)
            .max(100)
            .required()
            .messages({
                'string.min': 'El nombre debe tener al menos 2 caracteres',
                'string.max': 'El nombre no puede tener más de 100 caracteres',
                'any.required': 'El nombre es requerido'
            }),
        
        description: Joi.string()
            .max(500)
            .optional(),
        
        parent_id: Joi.number()
            .integer()
            .positive()
            .optional(),
        
        color: Joi.string()
            .pattern(/^#[0-9A-Fa-f]{6}$/)
            .optional(),
        
        icon: Joi.string()
            .max(50)
            .optional(),
        
        sort_order: Joi.number()
            .integer()
            .min(0)
            .optional()
    }),

    update: Joi.object({
        name: Joi.string()
            .min(2)
            .max(100)
            .optional(),
        
        description: Joi.string()
            .max(500)
            .optional(),
        
        parent_id: Joi.number()
            .integer()
            .positive()
            .optional(),
        
        color: Joi.string()
            .pattern(/^#[0-9A-Fa-f]{6}$/)
            .optional(),
        
        icon: Joi.string()
            .max(50)
            .optional(),
        
        sort_order: Joi.number()
            .integer()
            .min(0)
            .optional(),
        
        is_active: Joi.boolean()
            .optional()
    })
};

// Comment validation schema
export const commentValidation = {
    create: Joi.object({
        content: Joi.string()
            .min(1)
            .max(1000)
            .required()
            .messages({
                'string.min': 'El comentario no puede estar vacío',
                'string.max': 'El comentario no puede tener más de 1000 caracteres',
                'any.required': 'El contenido del comentario es requerido'
            }),
        
        parent_id: Joi.number()
            .integer()
            .positive()
            .optional()
    }),

    update: Joi.object({
        content: Joi.string()
            .min(1)
            .max(1000)
            .required()
            .messages({
                'string.min': 'El comentario no puede estar vacío',
                'string.max': 'El comentario no puede tener más de 1000 caracteres',
                'any.required': 'El contenido del comentario es requerido'
            })
    })
};

// General validation functions
export const validatePagination = (query) => {
    const schema = Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1),
        
        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(20),
        
        sort: Joi.string()
            .optional(),
        
        order: Joi.string()
            .valid('ASC', 'DESC', 'asc', 'desc')
            .default('DESC')
    });

    return schema.validate(query);
};

export const validateSearch = (query) => {
    const schema = Joi.object({
        q: Joi.string()
            .min(2)
            .max(200)
            .required()
            .messages({
                'string.min': 'La consulta de búsqueda debe tener al menos 2 caracteres',
                'string.max': 'La consulta de búsqueda es demasiado larga',
                'any.required': 'La consulta de búsqueda es requerida'
            }),
        
        category: Joi.alternatives()
            .try(
                Joi.number().integer().positive(),
                Joi.string()
            )
            .optional(),
        
        type: Joi.string()
            .valid('document', 'presentation', 'spreadsheet', 'image', 'video', 'audio', 'other')
            .optional(),
        
        page: Joi.number()
            .integer()
            .min(1)
            .default(1),
        
        limit: Joi.number()
            .integer()
            .min(1)
            .max(50)
            .default(20)
    });

    return schema.validate(query);
};

// Validation middleware creator
export const createValidationMiddleware = (schema, source = 'body') => {
    return (req, res, next) => {
        const data = source === 'query' ? req.query : req.body;
        const { error, value } = schema.validate(data, { 
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessages = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                message: 'Error de validación',
                errors: errorMessages
            });
        }

        // Replace the original data with validated data
        if (source === 'query') {
            req.query = value;
        } else {
            req.body = value;
        }

        next();
    };
};