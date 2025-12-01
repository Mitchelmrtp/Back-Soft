// 🔍 User Validator - Validation rules for user operations
// Following Strategy Pattern and consistent validation structure

import Joi from 'joi';

class UserValidator {
  // Validation schema for user registration
  static registrationSchema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.empty': 'El nombre es requerido',
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder 100 caracteres'
      }),

    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'El email debe tener un formato válido',
        'string.empty': 'El email es requerido'
      }),

    password: Joi.string()
      .min(6)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .required()
      .messages({
        'string.empty': 'La contraseña es requerida',
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
      }),

    role: Joi.string()
      .valid('student', 'teacher', 'admin')
      .default('student'),

    student_id: Joi.string()
      .when('role', {
        is: 'student',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),

    employee_id: Joi.string()
      .when('role', {
        is: Joi.valid('teacher', 'admin'),
        then: Joi.optional(),
        otherwise: Joi.forbidden()
      }),

    department: Joi.string().optional(),
    position: Joi.string().optional(),
    phone: Joi.string().optional(),
    bio: Joi.string().max(500).optional()
  });

  // Validation schema for user login
  static loginSchema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'El email debe tener un formato válido',
        'string.empty': 'El email es requerido'
      }),

    password: Joi.string()
      .required()
      .messages({
        'string.empty': 'La contraseña es requerida'
      })
  });

  // Validation schema for password change
  static changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'string.empty': 'La contraseña actual es requerida'
      }),

    newPassword: Joi.string()
      .min(6)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .required()
      .messages({
        'string.empty': 'La nueva contraseña es requerida',
        'string.min': 'La nueva contraseña debe tener al menos 6 caracteres',
        'string.pattern.base': 'La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número'
      })
  });

  // Validation schema for profile update
  static updateProfileSchema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .optional(),

    phone: Joi.string().optional(),
    telephone: Joi.string().optional(), // Campo para BD
    first_name: Joi.string().min(2).max(50).optional(),
    last_name: Joi.string().min(2).max(50).optional(),
    bio: Joi.string().max(500).optional(),
    department: Joi.string().optional(),
    position: Joi.string().optional()
  });

  // Validate registration data
  static validateRegistration(userData) {
    const { error, value } = this.registrationSchema.validate(userData, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return value;
  }

  // Validate login data
  static validateLogin(loginData) {
    const { error, value } = this.loginSchema.validate(loginData, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return value;
  }

  // Validate password change data
  static validateChangePassword(passwordData) {
    const { error, value } = this.changePasswordSchema.validate(passwordData, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return value;
  }

  // Validate profile update data
  static validateUpdateProfile(profileData) {
    const { error, value } = this.updateProfileSchema.validate(profileData, {
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

export default UserValidator;