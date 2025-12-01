// Logger removed

/**
 * Middleware para verificar permisos de administrador
 * Solo permite el acceso a usuarios con rol 'admin'
 */
const adminMiddleware = (req, res, next) => {
    try {
        if (!req.user) {
            console.log('Admin access denied - No user authenticated');
            return res.error('Usuario no autenticado', 401);
        }

        if (req.user.role !== 'admin') {
            console.log(`Admin access denied - User ${req.user.userId} has role: ${req.user.role}`);
            return res.error('Acceso denegado. Se requiere rol de administrador', 403);
        }

        console.log(`Admin access granted to user ${req.user.userId}`);
        next();
    } catch (error) {
        console.error('Error in admin middleware:', error);
        return res.error('Error de autorización', 500);
    }
};

/**
 * Middleware para verificar múltiples roles permitidos
 * @param {string[]} allowedRoles - Array de roles permitidos
 * @returns {Function} Middleware function
 */
export const roleMiddleware = (allowedRoles = ['admin']) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.error('Usuario no autenticado', 401);
            }

            if (!allowedRoles.includes(req.user.role)) {
                console.log(`Role access denied - User ${req.user.userId} has role: ${req.user.role}, required: ${allowedRoles.join(', ')}`);
                return res.error(`Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`, 403);
            }

            next();
        } catch (error) {
            console.error('Error in role middleware:', error);
            return res.error('Error de autorización', 500);
        }
    };
};

// Export adminOnly as an alias for adminMiddleware for backwards compatibility
export const adminOnly = adminMiddleware;

export default adminMiddleware;