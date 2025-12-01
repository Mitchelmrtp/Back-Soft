/**
 * PRUEBAS UNITARIAS - SISTEMA DE FILTRADO Y BÚSQUEDA
 * 
 * Tests para las funcionalidades de filtrado que acabamos de corregir:
 * - Filtrado por tipo de recurso
 * - Búsqueda por texto
 * - Filtrado por categoría
 * - Combinación de filtros
 * - Ordenamiento y paginación
 * - Validación de parámetros
 */

import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import { Resource, Category, User } from '../models/index.js';

// Variables globales
let authToken = null;
let testUser = null;
let testCategories = [];
let testResources = [];

describe('🔍 Pruebas de Sistema de Filtrado y Búsqueda', () => {
  
  beforeAll(async () => {
    console.log('🚀 Iniciando suite de pruebas de filtrado...');
    
    // Crear usuario de prueba
    const userData = {
      name: 'Filter Test User',
      email: `filter.test.${Date.now()}@universidad.edu`,
      password: 'FilterTest123!',
      role: 'admin'
    };

    const userResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = userResponse.body.data.token;
    testUser = userResponse.body.data.user;

    // Crear categorías de prueba
    const categoryNames = ['Matemáticas', 'Física', 'Programación', 'Algoritmos'];
    for (const name of categoryNames) {
      const category = await Category.create({
        name: `${name} Test ${Date.now()}`,
        description: `Categoría de ${name}`,
        category_type: 'subject_area',
        status: 'active'
      });
      testCategories.push(category);
    }

    // Crear conjunto diverso de recursos de prueba
    const resourcesData = [
      {
        title: 'Introducción a Algoritmos',
        description: 'Fundamentos de algoritmos y estructuras de datos',
        type: 'document',
        format: 'pdf',
        category_id: testCategories[3].id
      },
      {
        title: 'Video Tutorial de Python',
        description: 'Aprende Python desde cero',
        type: 'video',
        format: 'mp4',
        category_id: testCategories[2].id
      },
      {
        title: 'Diagrama de Flujo',
        description: 'Ejemplos de diagramas de flujo',
        type: 'image',
        format: 'png',
        category_id: testCategories[3].id
      },
      {
        title: 'Audio Clase de Física',
        description: 'Grabación de clase sobre mecánica cuántica',
        type: 'audio',
        format: 'mp3',
        category_id: testCategories[1].id
      },
      {
        title: 'Enlace a Recursos de Matemáticas',
        description: 'Colección de recursos matemáticos',
        type: 'link',
        format: 'url',
        category_id: testCategories[0].id
      },
      {
        title: 'Guía Completa de JavaScript',
        description: 'Documentación completa de JavaScript ES6+',
        type: 'document',
        format: 'pdf',
        category_id: testCategories[2].id
      },
      {
        title: 'Tutorial Avanzado de Algoritmos',
        description: 'Algoritmos avanzados y optimización',
        type: 'video',
        format: 'mp4',
        category_id: testCategories[3].id
      },
      {
        title: 'Infografía de Estructuras de Datos',
        description: 'Visualización de estructuras de datos',
        type: 'image',
        format: 'jpg',
        category_id: testCategories[3].id
      }
    ];

    for (const resourceData of resourcesData) {
      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...resourceData,
          file_url: `https://example.com/test/${resourceData.type}.${resourceData.format}`,
          status: 'published',
          visibility: 'public',
          file_size: 1024000
        });

      testResources.push(response.body.data.resource);
    }
  });

  afterAll(async () => {
    console.log('✅ Suite de pruebas de filtrado completada');
  });

  // ============================================
  // TEST 1: FILTRADO POR TIPO DE RECURSO
  // ============================================
  describe('Filtrado por tipo de recurso', () => {
    
    test('✅ Debe filtrar recursos tipo "document"', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ type: 'document' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources.length).toBeGreaterThan(0);
      
      // Verificar que TODOS los recursos sean del tipo document
      response.body.data.resources.forEach(resource => {
        expect(resource.type).toBe('document');
      });
    });

    test('✅ Debe filtrar recursos tipo "video"', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ type: 'video' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources.length).toBeGreaterThan(0);
      
      response.body.data.resources.forEach(resource => {
        expect(resource.type).toBe('video');
      });
    });

    test('✅ Debe filtrar recursos tipo "image"', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ type: 'image' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources.length).toBeGreaterThan(0);
      
      response.body.data.resources.forEach(resource => {
        expect(resource.type).toBe('image');
      });
    });

    test('✅ Debe filtrar recursos tipo "audio"', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ type: 'audio' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources.length).toBeGreaterThan(0);
      
      response.body.data.resources.forEach(resource => {
        expect(resource.type).toBe('audio');
      });
    });

    test('✅ Debe filtrar recursos tipo "link"', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ type: 'link' })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.resources.forEach(resource => {
        expect(resource.type).toBe('link');
      });
    });

    test('❌ Debe rechazar tipos de recurso NO VÁLIDOS (article, presentation)', async () => {
      const invalidTypes = ['article', 'presentation', 'slides', 'book'];
      
      for (const invalidType of invalidTypes) {
        const response = await request(app)
          .get('/api/resources')
          .query({ type: invalidType })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Filter validation error');
        expect(response.body.message).toContain('type');
        expect(response.body.message).toContain('must be one of');
      }
    });

    test('✅ Debe retornar array vacío para tipos válidos sin resultados', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ type: 'other' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.resources)).toBe(true);
    });
  });

  // ============================================
  // TEST 2: BÚSQUEDA POR TEXTO
  // ============================================
  describe('Búsqueda por texto', () => {
    
    test('✅ Debe buscar recursos por título', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ search: 'Algoritmos' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources.length).toBeGreaterThan(0);
      
      // Verificar que los resultados contengan el término buscado
      const hasMatch = response.body.data.resources.some(resource =>
        resource.title.toLowerCase().includes('algoritmos') ||
        resource.description.toLowerCase().includes('algoritmos')
      );
      expect(hasMatch).toBe(true);
    });

    test('✅ Debe buscar recursos por descripción', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ search: 'Python' })
        .expect(200);

      expect(response.body.success).toBe(true);
      const hasMatch = response.body.data.resources.some(resource =>
        resource.description.toLowerCase().includes('python')
      );
      expect(hasMatch).toBe(true);
    });

    test('✅ Debe ser case-insensitive en búsqueda', async () => {
      const searches = ['algoritmos', 'ALGORITMOS', 'AlGoRiTmOs'];
      
      for (const searchTerm of searches) {
        const response = await request(app)
          .get('/api/resources')
          .query({ search: searchTerm })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.resources.length).toBeGreaterThan(0);
      }
    });

    test('✅ Debe retornar array vacío para búsquedas sin resultados', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ search: 'xyzabc123notfound' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources).toEqual([]);
    });
  });

  // ============================================
  // TEST 3: FILTRADO POR CATEGORÍA
  // ============================================
  describe('Filtrado por categoría', () => {
    
    test('✅ Debe filtrar recursos por categoría específica', async () => {
      const categoryId = testCategories[3].id; // Algoritmos

      const response = await request(app)
        .get('/api/resources')
        .query({ category_id: categoryId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources.length).toBeGreaterThan(0);
      
      // Verificar que todos pertenecen a la categoría correcta
      response.body.data.resources.forEach(resource => {
        expect(resource.category_id).toBe(categoryId);
      });
    });

    test('✅ Debe retornar vacío para categoría sin recursos', async () => {
      const emptyCategory = await Category.create({
        name: `Empty Category ${Date.now()}`,
        description: 'Categoría sin recursos',
        category_type: 'subject_area',
        status: 'active'
      });

      const response = await request(app)
        .get('/api/resources')
        .query({ category_id: emptyCategory.id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources).toEqual([]);
    });
  });

  // ============================================
  // TEST 4: COMBINACIÓN DE FILTROS
  // ============================================
  describe('Combinación de múltiples filtros', () => {
    
    test('✅ Debe combinar tipo + búsqueda', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({
          type: 'document',
          search: 'Algoritmos'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.resources.forEach(resource => {
        expect(resource.type).toBe('document');
      });
    });

    test('✅ Debe combinar tipo + categoría', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({
          type: 'video',
          category_id: testCategories[2].id
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.resources.forEach(resource => {
        expect(resource.type).toBe('video');
        expect(resource.category_id).toBe(testCategories[2].id);
      });
    });

    test('✅ Debe combinar tipo + búsqueda + categoría', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({
          type: 'document',
          search: 'JavaScript',
          category_id: testCategories[2].id
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.resources.length > 0) {
        response.body.data.resources.forEach(resource => {
          expect(resource.type).toBe('document');
          expect(resource.category_id).toBe(testCategories[2].id);
        });
      }
    });

    test('✅ Debe combinar todos los filtros + ordenamiento + paginación', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({
          type: 'document',
          sort: 'created_at',
          order: 'DESC',
          page: 1,
          limit: 5
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources.length).toBeLessThanOrEqual(5);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
      
      response.body.data.resources.forEach(resource => {
        expect(resource.type).toBe('document');
      });
    });
  });

  // ============================================
  // TEST 5: ORDENAMIENTO
  // ============================================
  describe('Ordenamiento de resultados', () => {
    
    test('✅ Debe ordenar por fecha de creación (DESC)', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({
          sort: 'created_at',
          order: 'DESC'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const resources = response.body.data.resources;
      
      if (resources.length > 1) {
        for (let i = 0; i < resources.length - 1; i++) {
          const date1 = new Date(resources[i].created_at);
          const date2 = new Date(resources[i + 1].created_at);
          expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
        }
      }
    });

    test('✅ Debe ordenar por fecha de creación (ASC)', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({
          sort: 'created_at',
          order: 'ASC'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const resources = response.body.data.resources;
      
      if (resources.length > 1) {
        for (let i = 0; i < resources.length - 1; i++) {
          const date1 = new Date(resources[i].created_at);
          const date2 = new Date(resources[i + 1].created_at);
          expect(date1.getTime()).toBeLessThanOrEqual(date2.getTime());
        }
      }
    });

    test('✅ Debe ordenar por título alfabéticamente', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({
          sort: 'title',
          order: 'ASC'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const resources = response.body.data.resources;
      
      if (resources.length > 1) {
        for (let i = 0; i < resources.length - 1; i++) {
          expect(resources[i].title.localeCompare(resources[i + 1].title))
            .toBeLessThanOrEqual(0);
        }
      }
    });
  });

  // ============================================
  // TEST 6: PAGINACIÓN
  // ============================================
  describe('Paginación de resultados', () => {
    
    test('✅ Debe paginar correctamente con límite personalizado', async () => {
      const limit = 3;
      
      const response = await request(app)
        .get('/api/resources')
        .query({ limit })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources.length).toBeLessThanOrEqual(limit);
      expect(response.body.data.pagination.limit).toBe(limit);
    });

    test('✅ Debe navegar entre páginas correctamente', async () => {
      const limit = 2;
      
      // Página 1
      const page1 = await request(app)
        .get('/api/resources')
        .query({ page: 1, limit })
        .expect(200);

      // Página 2
      const page2 = await request(app)
        .get('/api/resources')
        .query({ page: 2, limit })
        .expect(200);

      expect(page1.body.success).toBe(true);
      expect(page2.body.success).toBe(true);
      
      // Verificar que son recursos diferentes
      if (page1.body.data.resources.length > 0 && page2.body.data.resources.length > 0) {
        const page1Ids = page1.body.data.resources.map(r => r.id);
        const page2Ids = page2.body.data.resources.map(r => r.id);
        
        const hasOverlap = page1Ids.some(id => page2Ids.includes(id));
        expect(hasOverlap).toBe(false);
      }
    });

    test('✅ Debe incluir información de paginación completa', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.data.pagination).toHaveProperty('page');
      expect(response.body.data.pagination).toHaveProperty('limit');
      expect(response.body.data.pagination).toHaveProperty('total');
      expect(response.body.data.pagination).toHaveProperty('totalPages');
    });
  });

  // ============================================
  // TEST 7: PREVENCIÓN DE INFINITE LOOPS
  // ============================================
  describe('Prevención de peticiones infinitas', () => {
    
    test('✅ Múltiples peticiones rápidas deben procesarse correctamente', async () => {
      const promises = [];
      
      // Enviar 5 peticiones simultáneas
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .get('/api/resources')
            .query({ type: 'document', page: 1 })
        );
      }

      const responses = await Promise.all(promises);
      
      // Todas deben ser exitosas
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    test('✅ Cambios rápidos de filtros no deben causar loops', async () => {
      const types = ['document', 'video', 'image'];
      const promises = types.map(type =>
        request(app)
          .get('/api/resources')
          .query({ type })
      );

      const responses = await Promise.all(promises);
      
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        response.body.data.resources.forEach(resource => {
          expect(resource.type).toBe(types[index]);
        });
      });
    });
  });

  // ============================================
  // TEST 8: VALIDACIÓN DE PARÁMETROS
  // ============================================
  describe('Validación de parámetros de filtrado', () => {
    
    test('✅ Debe aceptar parámetros vacíos', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ search: '', type: '' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('❌ Debe rechazar valores de orden inválidos', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ order: 'INVALID' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('❌ Debe rechazar página negativa', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ page: -1 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('❌ Debe rechazar límite excesivo', async () => {
      const response = await request(app)
        .get('/api/resources')
        .query({ limit: 1000 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
