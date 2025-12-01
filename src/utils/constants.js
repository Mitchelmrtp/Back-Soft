// 🔧 HTTP Status Codes - Centralized Status Code Management
// Following Configuration Pattern for consistent status codes

export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'Usuario registrado exitosamente',
  LOGIN_SUCCESS: 'Login exitoso',
  PROFILE_FETCHED: 'Perfil obtenido exitosamente',
  RESOURCE_CREATED: 'Recurso creado exitosamente',
  RESOURCE_UPDATED: 'Recurso actualizado exitosamente',
  RESOURCE_DELETED: 'Recurso eliminado exitosamente',
  CATEGORY_CREATED: 'Categoría creada exitosamente'
};

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  USER_NOT_FOUND: 'Usuario no encontrado',
  RESOURCE_NOT_FOUND: 'Recurso no encontrado',
  ACCESS_DENIED: 'Acceso denegado',
  EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
  VALIDATION_ERROR: 'Error de validación',
  INTERNAL_ERROR: 'Error interno del servidor'
};