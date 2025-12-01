// 📊 Logging Service - Centralized logging configuration
// Following Single Responsibility Principle and Configuration Pattern

class LoggingService {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isDebug = process.env.LOG_LEVEL === 'debug';
  }

  // Info level logging
  info(message, data = null) {
    if (this.isDevelopment) {
      console.log('ℹ️', message, data ? data : '');
    }
  }

  // Error level logging (always logged)
  error(message, error = null) {
    console.error('❌', message, error ? error : '');
  }

  // Warning level logging
  warn(message, data = null) {
    if (this.isDevelopment) {
      console.warn('⚠️', message, data ? data : '');
    }
  }

  // Debug level logging (only in debug mode)
  debug(message, data = null) {
    if (this.isDebug) {
      console.log('🔧', message, data ? data : '');
    }
  }

  // Success level logging
  success(message, data = null) {
    if (this.isDevelopment) {
      console.log('✅', message, data ? data : '');
    }
  }

  // Auth specific logging
  auth(message, data = null) {
    if (this.isDevelopment) {
      console.log('🔐', message, data ? data : '');
    }
  }
}

const logger = new LoggingService();
export default logger;