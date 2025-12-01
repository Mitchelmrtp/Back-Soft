import CategoryRepository from '../repositories/CategoryRepository.js';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors.js';
import { validateCategoryData, validateUpdateCategoryData } from '../validators/CategoryValidator.js';

/**
 * Service Layer para Category
 * Implementa la lógica de negocio
 * Principio Single Responsibility
 */
class CategoryService {
  constructor() {
    this.categoryRepository = CategoryRepository;
  }

  /**
   * Obtiene todas las categorías con paginación y filtros
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Object>} Resultado paginado
   */
  async getAllCategories(options = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      orderBy = 'name',
      orderDirection = 'ASC'
    } = options;

    try {
      const offset = (page - 1) * limit;
      const filters = {
        status,
        search,
        limit: parseInt(limit),
        offset,
        orderBy,
        orderDirection: orderDirection.toUpperCase()
      };

      const [categories, total] = await Promise.all([
        this.categoryRepository.findAll(filters),
        this.categoryRepository.count(filters)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        categories,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNext: page < totalPages,
          hasPrevious: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error obteniendo categorías: ${error.message}`);
    }
  }

  /**
   * Obtiene una categoría por ID o slug
   * @param {string} identifier - ID o slug de la categoría
   * @returns {Promise<Object>} Categoría encontrada
   */
  async getCategoryById(identifier) {
    try {
      let category;
      
      // Verificar si es UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
      
      if (isUUID) {
        category = await this.categoryRepository.findById(identifier);
      } else {
        category = await this.categoryRepository.findBySlug(identifier);
      }

      if (!category) {
        throw new NotFoundError('Categoría no encontrada');
      }

      return category;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error(`Error obteniendo categoría: ${error.message}`);
    }
  }

  /**
   * Crea una nueva categoría
   * @param {Object} categoryData - Datos de la categoría
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Object>} Categoría creada
   */
  async createCategory(categoryData, userId) {
    try {
      // Validar datos de entrada
      const validationResult = validateCategoryData(categoryData);
      if (!validationResult.isValid) {
        throw new ValidationError('Datos de categoría inválidos', validationResult.errors);
      }

      const { name, description, color, icon, image_url, parent_id } = categoryData;

      // Generar slug automáticamente
      const slug = await this._generateUniqueSlug(name);

      // Verificar si ya existe una categoría con el mismo nombre
      const existingCategory = await this.categoryRepository.existsByNameOrSlug(name, slug);
      if (existingCategory) {
        throw new ConflictError('Ya existe una categoría con ese nombre');
      }

      // Determinar el nivel de la categoría
      let level = 0;
      if (parent_id) {
        const parentCategory = await this.categoryRepository.findById(parent_id);
        if (!parentCategory) {
          throw new ValidationError('Categoría padre no encontrada');
        }
        level = parentCategory.level + 1;
      }

      // Obtener el siguiente sort_order
      const sortOrder = await this._getNextSortOrder(parent_id);

      const newCategoryData = {
        name,
        slug,
        description,
        color,
        icon,
        image_url,
        parent_id: parent_id || null,
        level,
        sort_order: sortOrder,
        status: 'active',
        created_by: userId
      };

      const category = await this.categoryRepository.create(newCategoryData);

      // Actualizar el conteo de recursos de la categoría padre si existe
      if (parent_id) {
        await this._updateParentResourceCount(parent_id);
      }

      return await this.categoryRepository.findById(category.id);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error(`Error creando categoría: ${error.message}`);
    }
  }

  /**
   * Actualiza una categoría existente
   * @param {string} id - ID de la categoría
   * @param {Object} updateData - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object>} Categoría actualizada
   */
  async updateCategory(id, updateData, userId) {
    try {
      // Verificar que la categoría existe
      const existingCategory = await this.categoryRepository.findById(id);
      if (!existingCategory) {
        throw new NotFoundError('Categoría no encontrada');
      }

      // Validar datos de entrada
      const validationResult = validateUpdateCategoryData(updateData);
      if (!validationResult.isValid) {
        throw new ValidationError('Datos de actualización inválidos', validationResult.errors);
      }

      const { name, description, color, icon, image_url, parent_id, status, sort_order } = updateData;

      // Si se actualiza el nombre, generar nuevo slug
      let slug = existingCategory.slug;
      if (name && name !== existingCategory.name) {
        slug = await this._generateUniqueSlug(name, id);

        // Verificar conflictos de nombre
        const existsByName = await this.categoryRepository.existsByNameOrSlug(name, slug, id);
        if (existsByName) {
          throw new ConflictError('Ya existe una categoría con ese nombre');
        }
      }

      // Validar cambio de categoría padre
      let level = existingCategory.level;
      if (parent_id !== undefined && parent_id !== existingCategory.parent_id) {
        if (parent_id) {
          const parentCategory = await this.categoryRepository.findById(parent_id);
          if (!parentCategory) {
            throw new ValidationError('Categoría padre no encontrada');
          }
          
          // Evitar referencias circulares
          if (await this._wouldCreateCircularReference(id, parent_id)) {
            throw new ValidationError('No se puede establecer una referencia circular');
          }
          
          level = parentCategory.level + 1;
        } else {
          level = 0;
        }
      }

      const updatedData = {
        ...updateData,
        slug,
        level,
        updated_by: userId,
        updated_at: new Date()
      };

      // Limpiar datos undefined
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === undefined) {
          delete updatedData[key];
        }
      });

      const updatedCategory = await this.categoryRepository.update(id, updatedData);

      // Actualizar contadores de recursos si es necesario
      if (parent_id !== undefined && parent_id !== existingCategory.parent_id) {
        if (existingCategory.parent_id) {
          await this._updateParentResourceCount(existingCategory.parent_id);
        }
        if (parent_id) {
          await this._updateParentResourceCount(parent_id);
        }
      }

      return updatedCategory;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error(`Error actualizando categoría: ${error.message}`);
    }
  }

  /**
   * Elimina una categoría (soft delete)
   * @param {string} id - ID de la categoría
   * @returns {Promise<boolean>} Éxito de la operación
   */
  async deleteCategory(id) {
    try {
      const category = await this.categoryRepository.findById(id);
      if (!category) {
        throw new NotFoundError('Categoría no encontrada');
      }

      // Verificar si tiene subcategorías activas
      const subcategories = await this.categoryRepository.getSubcategories(id);
      if (subcategories.length > 0) {
        throw new ConflictError('No se puede eliminar una categoría que tiene subcategorías');
      }

      // Verificar si tiene recursos asociados
      if (category.resources_count > 0) {
        throw new ConflictError('No se puede eliminar una categoría que tiene recursos asociados');
      }

      const deleted = await this.categoryRepository.delete(id);

      // Actualizar el conteo de la categoría padre si existe
      if (category.parent_id) {
        await this._updateParentResourceCount(category.parent_id);
      }

      return deleted;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error(`Error eliminando categoría: ${error.message}`);
    }
  }

  /**
   * Obtiene la estructura de árbol de categorías
   * @returns {Promise<Array>} Estructura de árbol
   */
  async getCategoryTree() {
    try {
      return await this.categoryRepository.getTreeStructure();
    } catch (error) {
      throw new Error(`Error obteniendo árbol de categorías: ${error.message}`);
    }
  }

  /**
   * Obtiene categorías principales
   * @returns {Promise<Array>} Categorías principales
   */
  async getRootCategories() {
    try {
      return await this.categoryRepository.getRootCategories();
    } catch (error) {
      throw new Error(`Error obteniendo categorías principales: ${error.message}`);
    }
  }

  // Métodos privados

  /**
   * Genera un slug único para la categoría
   * @param {string} name - Nombre de la categoría
   * @param {string} excludeId - ID a excluir
   * @returns {Promise<string>} Slug único
   */
  async _generateUniqueSlug(name, excludeId = null) {
    let baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    let slug = baseSlug;
    let counter = 1;

    while (await this.categoryRepository.existsByNameOrSlug('', slug, excludeId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Obtiene el siguiente número de orden para una categoría
   * @param {string} parentId - ID de la categoría padre
   * @returns {Promise<number>} Siguiente sort_order
   */
  async _getNextSortOrder(parentId = null) {
    const siblings = await this.categoryRepository.findAll({
      parent_id: parentId,
      orderBy: 'sort_order',
      orderDirection: 'DESC',
      limit: 1
    });

    return siblings.length > 0 ? siblings[0].sort_order + 1 : 1;
  }

  /**
   * Verifica si se crearía una referencia circular
   * @param {string} categoryId - ID de la categoría
   * @param {string} newParentId - ID del nuevo padre
   * @returns {Promise<boolean>} True si se crearía referencia circular
   */
  async _wouldCreateCircularReference(categoryId, newParentId) {
    if (categoryId === newParentId) {
      return true;
    }

    let currentParent = await this.categoryRepository.findById(newParentId);
    while (currentParent && currentParent.parent_id) {
      if (currentParent.parent_id === categoryId) {
        return true;
      }
      currentParent = await this.categoryRepository.findById(currentParent.parent_id);
    }

    return false;
  }

  /**
   * Actualiza el conteo de recursos de una categoría padre
   * @param {string} parentId - ID de la categoría padre
   */
  async _updateParentResourceCount(parentId) {
    // Esta función se implementará cuando se integre con el módulo de recursos
    // Por ahora es un placeholder
  }
}

export default new CategoryService();