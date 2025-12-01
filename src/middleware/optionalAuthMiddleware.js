// Middleware opcional de autenticación para el logout
// No falla si no hay token válido, pero extrae la información si está disponible

import jwt from 'jsonwebtoken';

const optionalAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7); // Remove 'Bearer ' prefix
            
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
                req.user = decoded; // Set user if token is valid
                console.log('🔑 Optional auth: Valid token found for user:', decoded.userId);
            } catch (error) {
                console.log('🔑 Optional auth: Invalid/expired token, continuing without user');
                // Don't set req.user but don't fail either
            }
        } else {
            console.log('🔑 Optional auth: No token provided, continuing without user');
        }
        
        next(); // Always continue to next middleware/route
    } catch (error) {
        console.error('❌ Optional auth middleware error:', error);
        next(); // Continue even on error
    }
};

export default optionalAuthMiddleware;