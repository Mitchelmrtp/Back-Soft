/**
 * Clases de error personalizadas
 * Implementan el principio de responsabilidad única
 * Facilitan el manejo de errores específicos
 */

/**
 * Error base para todos los errores personalizados
 */
class BaseError extends Error {
  constructor(message, statusCode, errorCode = null, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Mantener el stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convierte el error a un objeto JSON para respuestas de API
   * @returns {Object} Representación JSON del error
   */
  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        statusCode: this.statusCode,
        errorCode: this.errorCode,
        details: this.details,
        timestamp: this.timestamp
      }
    };
  }
}

/**
 * Error de validación de datos
 */
class ValidationError extends BaseError {
  constructor(message, details = null, errorCode = 'VALIDATION_ERROR') {
    super(message, 400, errorCode, details);
  }
}

/**
 * Error de solicitud incorrecta
 */
class BadRequestError extends BaseError {
  constructor(message, details = null, errorCode = 'BAD_REQUEST') {
    super(message, 400, errorCode, details);
  }
}

/**
 * Error de recurso no encontrado
 */
class NotFoundError extends BaseError {
  constructor(message, resourceType = null, resourceId = null) {
    super(message, 404, 'RESOURCE_NOT_FOUND', { resourceType, resourceId });
  }
}

/**
 * Error de conflicto (recurso duplicado, etc.)
 */
class ConflictError extends BaseError {
  constructor(message, conflictType = null, details = null) {
    super(message, 409, 'RESOURCE_CONFLICT', { conflictType, ...details });
  }
}

/**
 * Error de autorización
 */
class UnauthorizedError extends BaseError {
  constructor(message = 'No autorizado', details = null) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

/**
 * Error de permisos insuficientes
 */
class ForbiddenError extends BaseError {
  constructor(message = 'Permisos insuficientes', requiredPermission = null) {
    super(message, 403, 'FORBIDDEN', { requiredPermission });
  }
}

/**
 * Error de límite de tasa (rate limiting)
 */
class RateLimitError extends BaseError {
  constructor(message = 'Demasiadas solicitudes', retryAfter = null) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { retryAfter });
  }
}

/**
 * Error interno del servidor
 */
class InternalServerError extends BaseError {
  constructor(message = 'Error interno del servidor', originalError = null) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', { 
      originalMessage: originalError?.message 
    });
  }
}

/**
 * Error de base de datos
 */
class DatabaseError extends BaseError {
  constructor(message, operation = null, table = null, originalError = null) {
    super(message, 500, 'DATABASE_ERROR', { 
      operation, 
      table, 
      originalMessage: originalError?.message 
    });
  }
}

/**
 * Error de validación de negocio
 */
class BusinessRuleError extends BaseError {
  constructor(message, rule = null, details = null) {
    super(message, 422, 'BUSINESS_RULE_VIOLATION', { rule, ...details });
  }
}

/**
 * Error de dependencia externa
 */
class ExternalServiceError extends BaseError {
  constructor(message, service = null, operation = null, originalError = null) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', { 
      service, 
      operation, 
      originalMessage: originalError?.message 
    });
  }
}

/**
 * Mapea errores de Sequelize a errores personalizados
 * @param {Error} sequelizeError - Error de Sequelize
 * @returns {BaseError} Error personalizado correspondiente
 */
export function mapSequelizeError(sequelizeError) {
  const errorName = sequelizeError.name;
  const message = sequelizeError.message;

  switch (errorName) {
    case 'SequelizeValidationError':
      const validationErrors = sequelizeError.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      return new ValidationError('Datos de entrada inválidos', validationErrors);

    case 'SequelizeUniqueConstraintError':
      const field = sequelizeError.errors?.[0]?.path || 'campo';
      return new ConflictError(`Ya existe un registro con ese ${field}`);

    case 'SequelizeForeignKeyConstraintError':
      return new ValidationError('Referencia a registro inexistente');

    case 'SequelizeConnectionError':
    case 'SequelizeConnectionRefusedError':
    case 'SequelizeConnectionTimedOutError':
      return new DatabaseError('Error de conexión con la base de datos', null, null, sequelizeError);

    case 'SequelizeDatabaseError':
      return new DatabaseError('Error en la base de datos', null, null, sequelizeError);

    case 'SequelizeTimeoutError':
      return new DatabaseError('Tiempo de espera agotado en la base de datos', null, null, sequelizeError);

    default:
      return new InternalServerError('Error interno del servidor', sequelizeError);
  }
}

/**
 * Middleware para manejo global de errores
 * @param {Error} error - Error a manejar
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
export function errorHandler(error, req, res, next) {
  let handledError = error;

  // Si no es un error personalizado, intentar mapear
  if (!(error instanceof BaseError)) {
    // Mapear errores de Sequelize
    if (error.name && error.name.startsWith('Sequelize')) {
      handledError = mapSequelizeError(error);
    } else {
      // Error genérico
      handledError = new InternalServerError('Error interno del servidor', error);
    }
  }

  // Log del error para debugging
  console.error('Error handled:', {
    name: handledError.name,
    message: handledError.message,
    statusCode: handledError.statusCode,
    stack: handledError.stack,
    details: handledError.details,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    timestamp: handledError.timestamp
  });

  // Respuesta al cliente
  res.status(handledError.statusCode || 500).json(handledError.toJSON());
}

export {
  BaseError,
  ValidationError,
  BadRequestError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitError,
  InternalServerError,
  DatabaseError,
  BusinessRuleError,
  ExternalServiceError
};