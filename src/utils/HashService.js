// 🔒 Hash Service - Password Hashing Utility
// Following Single Responsibility Principle - Only handles password hashing

import bcrypt from 'bcryptjs';

class HashService {
  constructor() {
    this.saltRounds = 12;
  }

  // Hash password
  async hashPassword(password) {
    if (!password) {
      throw new Error('Password is required for hashing');
    }
    return await bcrypt.hash(password, this.saltRounds);
  }

  // Verify password
  async verifyPassword(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) {
      throw new Error('Both plain and hashed passwords are required');
    }
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default new HashService();