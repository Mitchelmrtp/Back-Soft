// 🔐 JWT Service - Token Management Layer
// Following Single Responsibility Principle - Only handles JWT operations

import jwt from 'jsonwebtoken';

class JwtService {
  constructor() {
    // JWT secret keys (from environment variables)
    this.ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'your-access-token-secret';
    this.REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret';
    
    // Token expiration times
    this.ACCESS_TOKEN_EXPIRES_IN = '1h';
    this.REFRESH_TOKEN_EXPIRES_IN = '7d';
  }

  // Generate access token
  generateAccessToken(payload) {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN
    });
  }

  // Generate refresh token
  generateRefreshToken(payload) {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN
    });
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET);
    } catch (error) {
      throw new Error('Refresh token inválido o expirado');
    }
  }

  // Generate token pair
  generateTokenPair(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }
}

export default new JwtService();