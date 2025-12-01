// 🔧 Error Processing Service - Business Logic Layer
// Handles Sequelize error processing and standardization
// Following Service Layer Pattern and Single Responsibility Principle

class ErrorProcessingService {
  // Process Sequelize validation errors
  static processSequelizeValidationError(error) {
    const errorMessages = error.errors.map(err => {
      if (err.path === 'email' && err.validatorKey === 'isEmail') {
        return 'El formato del email es inválido';
      }
      if (err.path === 'password' && err.validatorKey === 'len') {
        return 'La contraseña debe tener al menos 6 caracteres';
      }
      if (err.path === 'name' && err.validatorKey === 'len') {
        return 'El nombre debe tener al menos 2 caracteres';
      }
      return err.message;
    });
    
    return {
      message: errorMessages.join(', '),
      statusCode: 400
    };
  }

  // Process Sequelize unique constraint errors
  static processSequelizeUniqueConstraintError(error) {
    if (error.errors && error.errors[0] && error.errors[0].path === 'email') {
      return {
        message: 'El email ya está registrado',
        statusCode: 400
      };
    }
    
    return {
      message: 'Ya existe un registro con estos datos',
      statusCode: 400
    };
  }

  // Process general service errors
  static processServiceError(error) {
    // Handle service-specific errors
    if (error.message.includes('email ya está registrado')) {
      return {
        message: 'El email ya está registrado',
        statusCode: 400
      };
    }
    
    if (error.message.includes('not found')) {
      return {
        message: error.message,
        statusCode: 404
      };
    }
    
    if (error.message.includes('Access denied')) {
      return {
        message: error.message,
        statusCode: 403
      };
    }
    
    if (error.message.includes('Unauthorized')) {
      return {
        message: error.message,
        statusCode: 401
      };
    }
    
    return {
      message: error.message,
      statusCode: 400
    };
  }

  // Main error processing method
  static processError(error) {
    // Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return this.processSequelizeValidationError(error);
    }
    
    // Sequelize unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return this.processSequelizeUniqueConstraintError(error);
    }
    
    // Service-specific errors
    return this.processServiceError(error);
  }
}

export default ErrorProcessingService;