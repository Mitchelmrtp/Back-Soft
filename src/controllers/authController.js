import AuthService from '../services/AuthService.js';
import UserService from '../services/UserService.js';

export const register = async (req, res, next) => {
    try {
        const result = await AuthService.registerUser(req.body);
        res.success(result, 'Usuario registrado exitosamente', 201);

    } catch (error) {
        console.error('Register error:', error.message);
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        console.log('🚀 Login request received:', { body: req.body, headers: req.headers['content-type'] });
        const result = await AuthService.loginUser(req.body);
        res.success(result, 'Login exitoso');

    } catch (error) {
        console.error('Login error:', error.message);
        next(error);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const userProfile = await UserService.getUserProfile(req.user.userId);

        res.success(userProfile, 'Perfil obtenido exitosamente');

    } catch (error) {
        console.error('Get profile error:', error.message);
        next(error);
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.error('Refresh token requerido', 400);
        }

        const result = await AuthService.refreshAccessToken(token);

        res.success({
            token: result.accessToken,
            user: result.user
        }, 'Token renovado exitosamente');

    } catch (error) {
        console.error('Refresh token error:', error);
        res.error('Refresh token inválido', 401);
    }
};

export const logout = async (req, res) => {
    try {
        if (req.user && req.user.userId) {
            await AuthService.logoutUser(req.user.userId);
        }
        res.success(null, 'Sesión cerrada exitosamente');

    } catch (error) {
        console.error('❌ Logout error:', error);
        res.success(null, 'Logout completado');
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const userExists = await UserService.userExistsByEmail(email);
        
        if (userExists) {
            const resetToken = AuthService.generatePasswordResetToken(email);
        }

        res.success({
            ...(process.env.NODE_ENV === 'development' && userExists && { resetToken })
        }, 'Si el email existe, recibirás un enlace de recuperación');

    } catch (error) {
        console.error('Forgot password error:', error);
        res.error('Error interno del servidor', 500);
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.error('Token y nueva contraseña son requeridos', 400);
        }

        const decoded = AuthService.verifyPasswordResetToken(token);

        const user = await UserService.getUserProfile(decoded.userId);

        await UserService.changePassword(decoded.userId, null, password);

        res.success(null, 'Contraseña restablecida exitosamente');

    } catch (error) {
        console.error('Reset password error:', error);
        
        if (error.message.includes('Token de restablecimiento inválido') ||
            error.message.includes('Token inválido') ||
            error.message.includes('Usuario no encontrado')) {
            return res.error('Token inválido o expirado', 400);
        }

        res.error('Error interno del servidor', 500);
    }
};