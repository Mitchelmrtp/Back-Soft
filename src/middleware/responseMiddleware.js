// Response standardization middleware
// Ensures consistent API response format across all endpoints

export const standardResponse = (req, res, next) => {
    // Success response helper
    res.success = (data = null, message = 'Success', statusCode = 200) => {
        return res.status(statusCode).json({
            success: true,
            data: data,
            message: message
        });
    };

    // Error response helper
    res.error = (message = 'An error occurred', statusCode = 400, data = null) => {
        return res.status(statusCode).json({
            success: false,
            data: data,
            message: message
        });
    };

    next();
};

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Custom ValidationError from utils/errors.js
    if (err.name === 'ValidationError') {
        return res.status(err.statusCode || 400).json({
            success: false,
            message: err.message,
            data: err.details || null
        });
    }

    // Joi validation errors
    if (err.details && Array.isArray(err.details)) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            data: err.details.map(detail => detail.message)
        });
    }

    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(error => ({
            field: error.path,
            message: error.message
        }));
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            data: errors
        });
    }

    // Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            success: false,
            message: 'Duplicate value error',
            data: err.errors?.[0]?.message || 'Duplicate entry'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Database connection errors
    if (err.name === 'SequelizeConnectionError') {
        return res.status(503).json({
            success: false,
            message: 'Database connection error'
        });
    }

    // Default error response
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal server error';
    
    return res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};