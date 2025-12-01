/**
 * PRUEBAS UNITARIAS - AUTENTICACIÓN DE USUARIOS
 * 
 * Tests para las funcionalidades críticas de autenticación:
 * - Registro de usuarios
 * - Login/Logout
 * - Validación de tokens JWT
 * - Gestión de sesiones
 */

import { jest, describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import { User } from '../models/index.js';
import { generateTokenPair } from '../services/AuthService.js';
import bcrypt from 'bcryptjs';

// Mock de la base de datos para testing
let testUser = null;
let authToken = null;

describe('🔐 Pruebas de Autenticación', () => {
  
  beforeAll(async () => {
    // Configuración inicial antes de todas las pruebas
    console.log('🚀 Iniciando suite de pruebas de autenticación...');
  });

  afterAll(async () => {
    // Limpieza después de todas las pruebas
    console.log('✅ Suite de pruebas de autenticación completada');
  });

  beforeEach(() => {
    // Reset de mocks antes de cada prueba
    jest.clearAllMocks();
  });

  // ============================================
  // TEST 1: REGISTRO DE USUARIOS
  // ============================================
  describe('POST /api/auth/register - Registro de usuarios', () => {
    
    test('✅ Debe registrar un nuevo usuario con datos válidos', async () => {
      const newUser = {
        name: 'Juan Pérez Test',
        email: `test.${Date.now()}@universidad.edu`,
        password: 'SecurePass123!',
        first_name: 'Juan',
        last_name: 'Pérez',
        role: 'student'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      // Verificaciones
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registrado exitosamente');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      
      // Verificar estructura del usuario
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('email', newUser.email);
      expect(response.body.data.user).toHaveProperty('role', 'student');
      expect(response.body.data.user).not.toHaveProperty('password');
      
      // Guardar para pruebas posteriores
      testUser = response.body.data.user;
      authToken = response.body.data.token;
    });

    test('❌ Debe rechazar registro con email duplicado', async () => {
      // Primer registro
      const userData = {
        name: 'Usuario Duplicado',
        email: `duplicate.${Date.now()}@universidad.edu`,
        password: 'SecurePass123!'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Intento de registro duplicado
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email ya está registrado');
    });

    test('❌ Debe rechazar registro con datos incompletos', async () => {
      const incompleteData = {
        name: 'Usuario Incompleto'
        // Falta email y password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('requeridos');
    });

    test('❌ Debe rechazar registro con email inválido', async () => {
      const invalidEmail = {
        name: 'Usuario Test',
        email: 'email-invalido',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidEmail)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('❌ Debe rechazar registro con contraseña débil', async () => {
      const weakPassword = {
        name: 'Usuario Test',
        email: `test.${Date.now()}@universidad.edu`,
        password: '123' // Contraseña muy débil
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPassword)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // TEST 2: LOGIN DE USUARIOS
  // ============================================
  describe('POST /api/auth/login - Inicio de sesión', () => {
    
    beforeAll(async () => {
      // Crear usuario de prueba para login
      const testUserData = {
        name: 'Usuario Login Test',
        email: `login.test.${Date.now()}@universidad.edu`,
        password: 'TestPassword123!',
        role: 'student',
        status: 'active'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUserData);
      
      testUser = testUserData;
    });

    test('✅ Debe autenticar usuario con credenciales válidas', async () => {
      const credentials = {
        email: testUser.email,
        password: testUser.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      // Verificaciones
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('exitoso');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      
      // Verificar que el token sea válido (JWT formato)
      expect(response.body.data.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      
      authToken = response.body.data.token;
    });

    test('❌ Debe rechazar login con contraseña incorrecta', async () => {
      const wrongCredentials = {
        email: testUser.email,
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(wrongCredentials)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('inválidas');
    });

    test('❌ Debe rechazar login con email no registrado', async () => {
      const nonExistentUser = {
        email: 'noexiste@universidad.edu',
        password: 'SomePassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(nonExistentUser)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('❌ Debe rechazar login con campos vacíos', async () => {
      const emptyCredentials = {
        email: '',
        password: ''
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(emptyCredentials)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // TEST 3: VALIDACIÓN DE TOKENS Y SESIONES
  // ============================================
  describe('GET /api/auth/me - Verificación de sesión', () => {
    
    test('✅ Debe obtener datos del usuario autenticado con token válido', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).not.toHaveProperty('password');
    });

    test('❌ Debe rechazar solicitud sin token de autorización', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token de autenticación requerido');
    });

    test('❌ Debe rechazar token inválido o expirado', async () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token';

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('❌ Debe rechazar token con formato incorrecto', async () => {
      const malformedToken = 'not-a-valid-token-format';

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${malformedToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // TEST 4: REFRESH TOKEN
  // ============================================
  describe('POST /api/auth/refresh - Renovación de tokens', () => {
    
    let refreshToken = null;

    beforeAll(async () => {
      // Obtener refresh token
      const credentials = {
        email: testUser.email,
        password: testUser.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      refreshToken = response.body.data.refreshToken;
    });

    test('✅ Debe renovar access token con refresh token válido', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.token).toBeDefined();
      expect(typeof response.body.data.token).toBe('string');
      expect(response.body.data.token.length).toBeGreaterThan(0);
    });

    test('❌ Debe rechazar refresh con token inválido', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // TEST 5: LOGOUT
  // ============================================
  describe('POST /api/auth/logout - Cierre de sesión', () => {
    
    test('✅ Debe cerrar sesión correctamente', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Sesión cerrada exitosamente');
    });

    test('❌ Debe permitir logout sin token (optionalAuth)', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // ============================================
  // TEST 6: SEGURIDAD - HASH DE CONTRASEÑAS
  // ============================================
  describe('Seguridad de contraseñas', () => {
    
    test('✅ Las contraseñas deben estar hasheadas en la base de datos', async () => {
      const userData = {
        name: 'Test Hash',
        email: `hash.test.${Date.now()}@universidad.edu`,
        password: 'PlainTextPassword123!'
      };

      // Crear usuario
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const userId = response.body.data.user.id;

      // Verificar que la contraseña esté hasheada
      const user = await User.findByPk(userId);
      expect(user.password).not.toBe(userData.password);
      expect(user.password).toHaveLength(60); // bcrypt hash length
      
      // Verificar que el hash sea válido
      const isValid = await bcrypt.compare(userData.password, user.password);
      expect(isValid).toBe(true);
    });
  });
});
