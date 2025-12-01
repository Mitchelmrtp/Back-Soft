import UserService from '../services/UserService.js';
import UserValidator from '../validators/UserValidator.js';

// Get user profile
export const getUserProfile = async (req, res, next) => {
    try {
        const userProfile = await UserService.getUserProfile(req.user.userId);
        
        res.success(userProfile, 'Perfil obtenido exitosamente');
    } catch (error) {
        console.error('Get user profile error:', error.message);
        next(error);
    }
};

// Update user profile
export const updateUserProfile = async (req, res, next) => {
    try {
        // Validate input
        const validationResult = UserValidator.validateUpdateProfile(req.body);
        if (!validationResult.isValid) {
            return res.error('Error de validación', 400, validationResult.errors);
        }

        // Update profile using service
        const updatedUser = await UserService.updateUserProfile(
            req.user.userId, 
            req.body, 
            req.file // avatar file if uploaded
        );

        res.success(updatedUser, 'Perfil actualizado exitosamente');

    } catch (error) {
        console.error('Update user profile error:', error.message);
        next(error);
    }
};

// Change password
export const changePassword = async (req, res, next) => {
    try {
        // Validate input
        const validationResult = UserValidator.validateChangePassword(req.body);
        if (!validationResult.isValid) {
            return res.error('Error de validación', 400, validationResult.errors);
        }

        const { currentPassword, newPassword } = req.body;
        
        // Change password using service
        await UserService.changePassword(req.user.userId, currentPassword, newPassword);

        res.success(null, 'Contraseña actualizada exitosamente');

    } catch (error) {
        console.error('Change password error:', error.message);
        next(error);
    }
};
// Get user settings/preferences
export const getUserSettings = async (req, res, next) => {
    try {
        const settings = await UserService.getUserSettings(req.user.userId);

        res.success(settings, 'Configuración obtenida exitosamente');

    } catch (error) {
        console.error('Get user settings error:', error.message);
        next(error);
    }
};

// Update user settings/preferences
export const updateUserSettings = async (req, res, next) => {
    try {
        // Validate input - using profile validation for consistency
        const validationResult = UserValidator.validateUpdateProfile(req.body);
        if (!validationResult.isValid) {
            return res.error('Error de validación', 400, validationResult.errors);
        }

        const result = await UserService.updateUserSettings(req.user.userId, req.body.preferences);

        res.success(result, result.message);

    } catch (error) {
        console.error('Update user settings error:', error);
        
        if (error.message === 'Usuario no encontrado') {
            return res.error('Usuario no encontrado', 404);
        }
        
        res.error('Error interno del servidor', 500);
    }
};

// Upload user avatar
export const uploadAvatar = async (req, res, next) => {
    try {
        const result = await UserService.uploadAvatar(req.user.userId, req.file);

        res.success(result, result.message);

    } catch (error) {
        console.error('Upload avatar error:', error.message);
        next(error);
    }
};