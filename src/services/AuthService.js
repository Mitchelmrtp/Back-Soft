import UserRepository from '../repositories/UserRepository.js';
import JwtService from './JwtService.js';
import HashService from '../utils/HashService.js';
import { ValidationError } from '../utils/errors.js';

// 🔧 Auth Service - Business Logic Layer
// Following Service Layer Pattern and Single Responsibility Principle

class AuthService {
  constructor() {
    this.userRepository = UserRepository;
  }

  // Register new user - High level business logic
  async registerUser(userData) {
    // Validate required fields
    const { name, email, password, first_name, last_name, role = 'student' } = userData;
    
    if (!name || !email || !password) {
      throw new ValidationError('Nombre, email y contraseña son requeridos');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('El email ya está registrado');
    }

    // Hash password
    const hashedPassword = await HashService.hashPassword(password);

    // Create user data
    const newUserData = {
      name,
      email,
      password: hashedPassword,
      first_name,
      last_name,
      role,
      status: 'active'
    };

    // Create user
    const user = await this.userRepository.create(newUserData);

    // Generate tokens
    const tokens = JwtService.generateTokenPair(user);
    const safeUser = user.toSafeObject();

    return {
      user: safeUser,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }

  // Login user - High level business logic
  async loginUser(credentials) {
    const { email, password } = credentials;

    // Validate required fields
    if (!email || !password) {
      throw new ValidationError('Email y contraseña son requeridos');
    }

    // Authenticate user
    const user = await this.authenticateUser(email, password);

    // Generate tokens
    const tokens = JwtService.generateTokenPair(user);
    const safeUser = user.toSafeObject();

    return {
      user: safeUser,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }

  // Authenticate user credentials
  async authenticateUser(email, password) {
    try {
      console.log('🔍 Authenticating user:', { email });
      
      // Find user by email using repository
      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        console.log('❌ User not found:', email);
        throw new ValidationError('Credenciales inválidas');
      }

      console.log('✅ User found:', { id: user.id, email: user.email, status: user.status });

      // Check if user is active
      if (user.status === 'suspended' || user.status === 'deleted') {
        console.log('❌ User account inactive:', user.status);
        throw new ValidationError('Cuenta suspendida o desactivada');
      }

      console.log('🔑 Verifying password...');
      
      // Verify password
      const isValidPassword = await HashService.verifyPassword(password, user.password);
      
      console.log('🔐 Password verification result:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('❌ Password verification failed');
        throw new ValidationError('Credenciales inválidas');
      }

      console.log('✅ Authentication successful');

      // Update last login using repository
      await this.userRepository.updateLastLogin(user.id);

      return user;
    } catch (error) {
      console.error('🚨 Authentication error:', error.message);
      throw error;
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token using JwtService
      const decoded = JwtService.verifyRefreshToken(refreshToken);
      
      // Find user using repository
      const user = await this.userRepository.findById(decoded.userId);
      
      if (!user) {
        throw new ValidationError('Usuario no encontrado');
      }

      if (user.status === 'suspended' || user.status === 'deleted') {
        throw new ValidationError('Cuenta suspendida o desactivada');
      }

      // Generate new access token using JwtService
      const newAccessToken = JwtService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return {
        accessToken: newAccessToken,
        user: user.toSafeObject()
      };
    } catch (error) {
      throw error;
    }
  }

  // Validate token and get user
  async validateTokenAndGetUser(token) {
    try {
      const decoded = JwtService.verifyAccessToken(token);
      
      const user = await this.userRepository.findById(decoded.userId);
      
      if (!user) {
        throw new ValidationError('Usuario no encontrado');
      }

      if (user.status === 'suspended' || user.status === 'deleted') {
        throw new ValidationError('Cuenta suspendida o desactivada');
      }

      return { user, decoded };
    } catch (error) {
      throw error;
    }
  }

  // Logout user (invalidate tokens)
  async logoutUser(userId) {
    try {
      // Update user's last logout time using repository
      await this.userRepository.update(userId, { last_logout: new Date() });
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  // Generate password reset token
  generatePasswordResetToken(userId) {
    return JwtService.generateAccessToken({ 
      userId, 
      type: 'password_reset' 
    });
  }

  // Verify password reset token
  verifyPasswordResetToken(token) {
    try {
      const decoded = JwtService.verifyAccessToken(token);
      
      if (decoded.type !== 'password_reset') {
        throw new ValidationError('Token inválido');
      }
      
      return decoded;
    } catch (error) {
      throw new ValidationError('Token de restablecimiento inválido o expirado');
    }
  }
}

// Export singleton instance
export default new AuthService();