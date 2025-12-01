import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import AuthService from '../services/AuthService.js';

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        console.log('Auth middleware processing request', {
            method: req.method,
            url: req.url,
            hasAuthHeader: !!authHeader
        });
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No valid Authorization header');
            return res.error('Token de autenticación requerido', 401);
        }

        const token = authHeader.slice(7); // Remove 'Bearer ' prefix
        console.log('Token extracted:', token.substring(0, 50) + '...');
        
        // Validate JWT token directly
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully:', decoded.userId);
        
        // Get user from database
        const user = await User.findByPk(decoded.userId);
        console.log('User found:', user ? user.email : 'null');
        
        if (!user || user.status === 'suspended' || user.status === 'deleted') {
            console.log('User not found or inactive');
            return res.error('Usuario no válido o inactivo', 401);
        }

        req.user = {
            id: user.id,         // ✅ Add both for compatibility
            userId: user.id,     // Keep existing for backward compatibility
            role: user.role,
            email: user.email
        };
        
        console.log('🔐 Authentication successful', {
            userId: req.user.userId,
            role: user.role
        });
        
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.error('Token inválido', 401);
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.error('Token expirado', 401);
        }
        
        return res.error('Error de autenticación', 401);
    }
};

// Optional auth middleware - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('🔍 OptionalAuth middleware processing request', {
            method: req.method,
            url: req.url,
            hasAuthHeader: !!authHeader
        });
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('🔍 OptionalAuth - No auth header, setting req.user = null');
            req.user = null;
            return next();
        }

        const token = authHeader.slice(7);
        
        // Use AuthService to validate token and get user
        const result = await AuthService.validateTokenAndGetUser(token);
        
        if (result && result.user) {
            const user = result.user;
            req.user = {
                userId: user.id,
                role: user.role,
                email: user.email
            };
            console.log('🔍 OptionalAuth - User authenticated:', { userId: req.user.userId, role: req.user.role });
        } else {
            req.user = null;
            console.log('🔍 OptionalAuth - Token invalid, setting req.user = null');
        }
        
        next();
    } catch (error) {
        console.log('🔍 OptionalAuth - Error occurred, setting req.user = null:', error.message);
        req.user = null;
        next();
    }
};

// Export authenticate as an alias for authMiddleware for backwards compatibility
export const authenticate = authMiddleware;

export default authMiddleware;