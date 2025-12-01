import UserValidator from './UserValidator.js';

class ValidatorFactory {
  static createValidator(type) {
    switch (type) {
      case 'user':
        return UserValidator;
      case 'profile':
        return new ProfileValidatorDecorator(UserValidator);
      case 'avatar':
        return new AvatarValidatorDecorator(UserValidator);
      default:
        throw new Error(`Unknown validator type: ${type}`);
    }
  }
}

// 🎨 Profile Validator Decorator - Decorator Pattern implementation
class ProfileValidatorDecorator {
  constructor(validator) {
    this.validator = validator;
  }

  /**
   * Validate profile data with additional checks
   * @param {Object} profileData - Profile data to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validated data
   */
  validateUpdateProfile(profileData, options = {}) {
    // First use base validator
    const validatedData = this.validator.validateUpdateProfile(profileData);
    
    // Add additional profile-specific validations
    // For partial updates (default), don't require all fields
    if (options.requireComplete === true) {
      this.validateProfileCompletion(validatedData);
    }
    this.validatePhoneFormat(validatedData.phone || validatedData.telephone);
    this.validateBioLength(validatedData.bio);
    
    return validatedData;
  }

  /**
   * Validate profile completion
   * @param {Object} data - Profile data
   */
  validateProfileCompletion(data) {
    const requiredFields = ['name'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Validate phone format
   * @param {string} phone - Phone number
   */
  validatePhoneFormat(phone) {
    if (phone && !/^[\+]?[\d\s\-\(\)]{6,20}$/.test(phone.replace(/\s/g, ''))) {
      throw new Error('Formato de teléfono inválido');
    }
  }

  /**
   * Validate bio length
   * @param {string} bio - Bio text
   */
  validateBioLength(bio) {
    if (bio && bio.length > 500) {
      throw new Error('La biografía no puede exceder 500 caracteres');
    }
  }

  // Delegate other methods to base validator
  validateRegistration(userData) {
    return this.validator.validateRegistration(userData);
  }

  validateLogin(loginData) {
    return this.validator.validateLogin(loginData);
  }

  validateChangePassword(passwordData) {
    return this.validator.validateChangePassword(passwordData);
  }
}

// 🖼️ Avatar Validator Decorator - Decorator Pattern for file validation
class AvatarValidatorDecorator {
  constructor(validator) {
    this.validator = validator;
    this.allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
  }

  /**
   * Validate avatar file
   * @param {Object} file - Uploaded file
   */
  validateAvatar(file) {
    if (!file) {
      throw new Error('Archivo de avatar requerido');
    }

    this.validateFileType(file);
    this.validateFileSize(file);
    this.validateFileName(file);
  }

  /**
   * Validate file type
   * @param {Object} file - File object
   */
  validateFileType(file) {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Tipo de archivo no permitido. Tipos permitidos: ${this.allowedMimeTypes.join(', ')}`);
    }
  }

  /**
   * Validate file size
   * @param {Object} file - File object
   */
  validateFileSize(file) {
    if (file.size > this.maxFileSize) {
      throw new Error(`El archivo es demasiado grande. Tamaño máximo: ${this.maxFileSize / (1024 * 1024)}MB`);
    }
  }

  /**
   * Validate file name
   * @param {Object} file - File object
   */
  validateFileName(file) {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
    if (sanitizedName !== file.originalname) {
      console.warn('Nombre de archivo contiene caracteres especiales');
    }
  }

  // Delegate other methods to base validator
  validateRegistration(userData) {
    return this.validator.validateRegistration(userData);
  }

  validateLogin(loginData) {
    return this.validator.validateLogin(loginData);
  }

  validateChangePassword(passwordData) {
    return this.validator.validateChangePassword(passwordData);
  }

  validateUpdateProfile(profileData) {
    return this.validator.validateUpdateProfile(profileData);
  }
}

export default ValidatorFactory;
export { ProfileValidatorDecorator, AvatarValidatorDecorator };