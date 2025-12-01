/**
 * PRUEBAS UNITARIAS - GESTIÓN DE RECURSOS
 * 
 * Tests para las funcionalidades core del sistema:
 * - Creación de recursos
 * - Lectura y listado con filtros
 * - Actualización de recursos
 * - Eliminación de recursos
 * - Validación de permisos
 */

import { jest, describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import { Resource, User, Category } from '../models/index.js';
import path from 'path';

// Variables globales para las pruebas
let adminToken = null;
let studentToken = null;
let adminUser = null;
let studentUser = null;
let testResource = null;
let testCategory = null;

describe('📚 Pruebas de Gestión de Recursos', () => {
  
  beforeAll(async () => {
    console.log('🚀 Iniciando suite de pruebas de recursos...');
    
    // Crear usuarios de prueba (admin y student)
    const adminData = {
      name: 'Admin Test',
      email: `admin.${Date.now()}@universidad.edu`,
      password: 'AdminPass123!',
      role: 'admin'
    };

    const studentData = {
      name: 'Student Test',
      email: `student.${Date.now()}@universidad.edu`,
      password: 'StudentPass123!',
      role: 'student'
    };

    // Registrar y obtener tokens
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send(adminData);
    
    const studentResponse = await request(app)
      .post('/api/auth/register')
      .send(studentData);

    adminToken = adminResponse.body.data.token;
    studentToken = studentResponse.body.data.token;
    adminUser = adminResponse.body.data.user;
    studentUser = studentResponse.body.data.user;

    // Crear categoría de prueba
    testCategory = await Category.create({
      name: `Test Category ${Date.now()}`,
      description: 'Categoría para pruebas',
      category_type: 'subject_area',
      status: 'active'
    });
  });

  afterAll(async () => {
    // Limpieza después de todas las pruebas
    console.log('✅ Suite de pruebas de recursos completada');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // TEST 1: CREACIÓN DE RECURSOS
  // ============================================
  describe('POST /api/resources - Creación de recursos', () => {
    
    test('✅ Admin debe poder crear un recurso válido', async () => {
      const resourceData = {
        title: 'Guía de Algoritmos y Estructuras de Datos',
        description: 'Material completo sobre algoritmos fundamentales',
        type: 'document',
        format: 'pdf',
        file_url: 'https://example.com/resources/algoritmos.pdf',
        file_size: 2048576,
        status: 'published',
        visibility: 'public',
        academic_year: 2025,
        semester: 3,
        category_id: testCategory.id
      };

      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(resourceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('resource');
      expect(response.body.data.resource).toHaveProperty('id');
      expect(response.body.data.resource.title).toBe(resourceData.title);
      expect(response.body.data.resource.type).toBe('document');
      expect(response.body.data.resource.user_id).toBe(adminUser.id);

      testResource = response.body.data.resource;
    });

    test('✅ Debe validar tipos de recursos permitidos', async () => {
      const validTypes = ['document', 'video', 'image', 'audio', 'link', 'other'];
      
      for (const type of validTypes) {
        const resourceData = {
          title: `Test ${type} Resource`,
          description: `Testing ${type} type`,
          type: type,
          file_url: `https://example.com/test.${type}`,
          status: 'published'
        };

        const response = await request(app)
          .post('/api/resources')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(resourceData)
          .expect(201);

        expect(response.body.data.resource.type).toBe(type);
      }
    });

    test('❌ Debe rechazar creación con tipo de recurso inválido', async () => {
      const invalidResource = {
        title: 'Recurso con tipo inválido',
        description: 'Test',
        type: 'article', // Tipo no válido
        file_url: 'https://example.com/test.pdf'
      };

      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidResource)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('El tipo debe ser');
    });

    test('❌ Debe rechazar creación sin campos obligatorios', async () => {
      const incompleteResource = {
        title: 'Recurso incompleto'
        // Falta description, type, file_url
      };

      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteResource)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('❌ Debe rechazar creación sin autenticación', async () => {
      const resourceData = {
        title: 'Recurso sin auth',
        description: 'Test',
        type: 'document',
        file_url: 'https://example.com/test.pdf'
      };

      const response = await request(app)
        .post('/api/resources')
        .send(resourceData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // TEST 2: LECTURA Y LISTADO DE RECURSOS
  // ============================================
  describe('GET /api/resources - Listado y filtrado de recursos', () => {
    
    beforeAll(async () => {
      // Crear varios recursos de prueba
      const resourceTypes = ['document', 'video', 'image', 'audio'];
      
      for (let i = 0; i < resourceTypes.length; i++) {
        await request(app)
          .post('/api/resources')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            title: `Test Resource ${resourceTypes[i]} ${i}`,
            description: `Description for ${resourceTypes[i]}`,
            type: resourceTypes[i],
            file_url: `https://example.com/test${i}.${resourceTypes[i]}`,
            status: 'published',
            visibility: 'public'
          });
      }
    });

    test('✅ Debe listar todos los recursos públicos', async () => {
      const response = await request(app)
        .get('/api/resources')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('resources');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.resources)).toBe(true);
      expect(response.body.data.resources.length).toBeGreaterThan(0);
    });

    test('✅ Debe filtrar recursos por tipo (document)', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ type: 'document' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources.length).toBeGreaterThan(0);
      
      // Verificar que todos los recursos sean del tipo solicitado
      response.body.data.resources.forEach(resource => {
        expect(resource.type).toBe('document');
      });
    });

    test('✅ Debe filtrar recursos por tipo (video)', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ type: 'video' })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.resources.forEach(resource => {
        expect(resource.type).toBe('video');
      });
    });

    test('✅ Debe filtrar recursos por búsqueda de texto', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ search: 'Algorithm' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('resources');
    });

    test('✅ Debe filtrar recursos por categoría', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ category_id: testCategory.id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources.length).toBeGreaterThan(0);
    });

    test('✅ Debe soportar ordenamiento (más recientes primero)', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ sort: 'created_at', order: 'DESC' })
        .expect(200);

      expect(response.body.success).toBe(true);
      const resources = response.body.data.resources;
      
      if (resources.length > 1) {
        const firstDate = new Date(resources[0].created_at);
        const secondDate = new Date(resources[1].created_at);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }
    });

    test('✅ Debe soportar paginación', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination).toHaveProperty('page', 1);
      expect(response.body.data.pagination).toHaveProperty('limit', 5);
      expect(response.body.data.pagination).toHaveProperty('total');
      expect(response.body.data.resources.length).toBeLessThanOrEqual(5);
    });

    test('✅ Debe combinar múltiples filtros', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({
          type: 'document',
          sort: 'created_at',
          order: 'DESC',
          limit: 10
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.resources.forEach(resource => {
        expect(resource.type).toBe('document');
      });
    });

    test('❌ Debe rechazar tipo de recurso inválido en filtros', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ type: 'presentation' }) // Tipo inválido
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Filter validation error');
      expect(response.body.message).toContain('type');
    });
  });

  // ============================================
  // TEST 3: OBTENER UN RECURSO ESPECÍFICO
  // ============================================
  describe('GET /api/resources/:id - Obtener recurso por ID', () => {
    
    test('✅ Debe obtener un recurso existente por ID', async () => {
      const response = await request(app)
        .get(`/api/resources/${testResource.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('resource');
      expect(response.body.data.resource.id).toBe(testResource.id);
      expect(response.body.data.resource).toHaveProperty('title');
      expect(response.body.data.resource).toHaveProperty('author');
    });

    test('❌ Debe retornar 404 para recurso inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .get(`/api/resources/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Resource not found');
    });

    test('❌ Debe rechazar ID con formato inválido', async () => {
      const response = await request(app)
        .get('/api/resources/invalid-id-format')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // TEST 4: ACTUALIZACIÓN DE RECURSOS
  // ============================================
  describe('PUT /api/resources/:id - Actualización de recursos', () => {
    
    test('✅ Admin debe poder actualizar un recurso', async () => {
      const updateData = {
        title: 'Título Actualizado de Algoritmos',
        description: 'Descripción actualizada del recurso',
        status: 'published'
      };

      const response = await request(app)
        .put(`/api/resources/${testResource.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resource.title).toBe(updateData.title);
      expect(response.body.data.resource.description).toBe(updateData.description);
    });

    test('✅ Propietario del recurso debe poder actualizarlo', async () => {
      // Crear recurso como estudiante
      const studentResource = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Student Resource',
          description: 'Resource by student',
          type: 'document',
          file_url: 'https://example.com/student.pdf',
          status: 'draft'
        });

      const resourceId = studentResource.body.data.resource.id;

      // Actualizar como propietario
      const updateData = {
        title: 'Updated by Owner',
        status: 'published'
      };

      const response = await request(app)
        .put(`/api/resources/${resourceId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resource.title).toBe(updateData.title);
    });

    test('❌ Usuario no propietario no debe poder actualizar', async () => {
      const updateData = {
        title: 'Intento de actualización no autorizada'
      };

      // Intentar actualizar con un usuario diferente
      const response = await request(app)
        .put(`/api/resources/${testResource.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });

    test('❌ Debe rechazar actualización sin autenticación', async () => {
      const updateData = {
        title: 'Intento sin auth'
      };

      const response = await request(app)
        .put(`/api/resources/${testResource.id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // TEST 5: ELIMINACIÓN DE RECURSOS
  // ============================================
  describe('DELETE /api/resources/:id - Eliminación de recursos', () => {
    
    let resourceToDelete = null;

    beforeEach(async () => {
      // Crear recurso para eliminar
      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Resource to Delete',
          description: 'This will be deleted',
          type: 'document',
          file_url: 'https://example.com/delete.pdf',
          status: 'draft'
        });

      resourceToDelete = response.body.data.resource;
    });

    test('✅ Admin debe poder eliminar cualquier recurso', async () => {
      const response = await request(app)
        .delete(`/api/resources/${resourceToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Resource deleted successfully');

      // Verificar que el recurso ya no existe
      const checkResponse = await request(app)
        .get(`/api/resources/${resourceToDelete.id}`)
        .expect(404);

      expect(checkResponse.body.success).toBe(false);
    });

    test('✅ Propietario debe poder eliminar su propio recurso', async () => {
      // Crear recurso como estudiante
      const studentResource = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Student Resource to Delete',
          description: 'Test description for deletion',
          type: 'document',
          file_url: 'https://example.com/student-delete.pdf',
          status: 'draft',
          category_id: testCategory.id
        })
        .expect(201);

      expect(studentResource.body.success).toBe(true);
      expect(studentResource.body.data).toBeDefined();
      expect(studentResource.body.data.resource).toBeDefined();
      const resourceId = studentResource.body.data.resource.id;

      // Eliminar como propietario
      const response = await request(app)
        .delete(`/api/resources/${resourceId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('❌ Usuario no propietario no debe poder eliminar', async () => {
      const response = await request(app)
        .delete(`/api/resources/${resourceToDelete.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('❌ Debe rechazar eliminación sin autenticación', async () => {
      const response = await request(app)
        .delete(`/api/resources/${resourceToDelete.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // TEST 6: ESTADÍSTICAS Y CONTADORES
  // ============================================
  describe('Estadísticas de recursos', () => {
    
    test('✅ Debe incrementar contador de vistas', async () => {
      const initialViews = testResource.views_count || 0;

      // Simular vista del recurso
      await request(app)
        .get(`/api/resources/${testResource.id}`)
        .expect(200);

      // Verificar incremento
      const response = await request(app)
        .get(`/api/resources/${testResource.id}`)
        .expect(200);

      expect(response.body.data.resource.views_count).toBeGreaterThan(initialViews);
    });
  });
});
