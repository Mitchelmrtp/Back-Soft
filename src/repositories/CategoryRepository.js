import { Category } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Repository Pattern para Category
 * Implementa el principio de Single Responsibility
 * Abstrae la lógica de acceso a datos
 */
class CategoryRepository {
  /**
   * Obtiene todas las categorías con filtros opcionales
   * @param {Object} filters - Filtros para la consulta
   * @returns {Promise<Array>} Lista de categorías
   */
  async findAll(filters = {}) {
    const { status, search, limit, offset, orderBy = 'name', orderDirection = 'ASC' } = filters;
    
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const options = {
      where,
      order: [[orderBy, orderDirection]]
    };
    
    if (limit) {
      options.limit = limit;
      if (offset) {
        options.offset = offset;
      }
    }
    
    return await Category.findAll(options);
  }

  /**
   * Obtiene el total de categorías con filtros
   * @param {Object} filters - Filtros para el conteo
   * @returns {Promise<number>} Total de categorías
   */
  async count(filters = {}) {
    const { status, search } = filters;
    
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    return await Category.count({ where });
  }

  /**
   * Obtiene una categoría por ID
   * @param {string} id - ID de la categoría
   * @returns {Promise<Object|null>} Categoría encontrada
   */
  async findById(id) {
    return await Category.findByPk(id);
  }

  /**
   * Obtiene una categoría por nombre
   * @param {string} name - Nombre de la categoría
   * @returns {Promise<Object|null>} Categoría encontrada
   */
  async findByName(name) {
    return await Category.findOne({
      where: { name }
    });
  }

  /**
   * Crea una nueva categoría
   * @param {Object} categoryData - Datos de la categoría
   * @returns {Promise<Object>} Categoría creada
   */
  async create(categoryData) {
    return await Category.create(categoryData);
  }

  /**
   * Actualiza una categoría
   * @param {string} id - ID de la categoría
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object|null>} Categoría actualizada
   */
  async update(id, updateData) {
    const [updatedRowsCount] = await Category.update(updateData, {
      where: { id },
      returning: true
    });
    
    if (updatedRowsCount === 0) {
      return null;
    }
    
    return await this.findById(id);
  }

  /**
   * Elimina una categoría (soft delete)
   * @param {string} id - ID de la categoría
   * @returns {Promise<boolean>} Éxito de la operación
   */
  async delete(id) {
    const deletedRowsCount = await Category.destroy({
      where: { id }
    });
    
    return deletedRowsCount > 0;
  }

  /**
   * Obtiene todas las categorías activas ordenadas
   * @returns {Promise<Array>} Categorías activas
   */
  async getTreeStructure() {
    // Return simple flat structure since the model doesn't support hierarchy
    const categories = await Category.findAll({
      where: { status: 'active' },
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
      attributes: ['id', 'name', 'description', 'category_type', 'sort_order']
    });

    return categories.map(cat => cat.toJSON());
  }

  /**
   * Verifica si existe una categoría con el mismo nombre
   * @param {string} name - Nombre de la categoría
   * @param {string} excludeId - ID a excluir de la verificación
   * @returns {Promise<boolean>} True si existe
   */
  async existsByName(name, excludeId = null) {
    const where = {
      name: { [Op.iLike]: name }
    };
    
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    
    const count = await Category.count({ where });
    return count > 0;
  }

  /**
   * Obtiene todas las categorías activas
   * @returns {Promise<Array>} Categorías activas
   */
  async getActiveCategories() {
    return await Category.findAll({
      where: { 
        status: 'active'
      },
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
      attributes: ['id', 'name', 'description', 'category_type', 'sort_order', 'status']
    });
  }

  /**
   * Count all categories
   * @returns {Promise<number>} Total count
   */
  async count() {
    try {
      return await Category.count();
    } catch (error) {
      throw new Error(`Error counting categories: ${error.message}`);
    }
  }

  /**
   * Get category usage statistics
   * @param {Date} dateFrom - Start date
   * @param {Date} dateTo - End date
   * @returns {Promise<Array>} Category usage stats
   */
  async getCategoryUsageStats(dateFrom, dateTo) {
    try {
      const { Resource } = await import('../models/index.js');
      
      return await Category.findAll({
        attributes: [
          'id',
          'name',
          [Category.sequelize.fn('COUNT', Category.sequelize.col('resources.id')), 'resource_count']
        ],
        include: [{
          model: Resource,
          as: 'resources',
          attributes: [],
          where: {
            created_at: {
              [Category.sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
            }
          },
          required: false
        }],
        group: ['Category.id'],
        order: [[Category.sequelize.fn('COUNT', Category.sequelize.col('resources.id')), 'DESC']]
      });
    } catch (error) {
      throw new Error(`Error getting category usage stats: ${error.message}`);
    }
  }
}

export default new CategoryRepository();