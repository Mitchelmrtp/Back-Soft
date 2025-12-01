import CategoryService from '../services/CategoryService.js';
import { validateQueryFilters, validateUUID } from '../validators/CategoryValidator.js';
import { 
  ValidationError, 
  NotFoundError, 
  ConflictError,
  ForbiddenError 
} from '../utils/errors.js';

export const getCategories = async (req, res, next) => {
  try {
    const validationResult = validateQueryFilters(req.query);
    if (!validationResult.isValid) {
      throw new ValidationError('Parámetros de consulta inválidos', validationResult.errors);
    }

    const options = validationResult.data;
    const result = await CategoryService.getAllCategories(options);

    res.status(200).json({
      success: true,
      data: result.categories,
      pagination: result.pagination,
      message: 'Categorías obtenidas exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene una categoría por ID o slug
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ValidationError('ID de categoría requerido');
    }

    const category = await CategoryService.getCategoryById(id);

    res.status(200).json({
      success: true,
      data: category,
      message: 'Categoría obtenida exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crea una nueva categoría
 */
export const createCategory = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      throw new ValidationError('Usuario no autenticado');
    }

    const category = await CategoryService.createCategory(req.body, userId);

    res.status(201).json({
      success: true,
      data: category,
      message: 'Categoría creada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualiza una categoría existente
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      throw new ValidationError('Usuario no autenticado');
    }

    // Validar UUID
    const uuidValidation = validateUUID(id);
    if (!uuidValidation.isValid) {
      throw new ValidationError('ID de categoría inválido');
    }

    const category = await CategoryService.updateCategory(id, req.body, userId);

    res.status(200).json({
      success: true,
      data: category,
      message: 'Categoría actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina una categoría (soft delete)
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      throw new ValidationError('Usuario no autenticado');
    }

    // Validar UUID
    const uuidValidation = validateUUID(id);
    if (!uuidValidation.isValid) {
      throw new ValidationError('ID de categoría inválido');
    }

    const deleted = await CategoryService.deleteCategory(id);

    if (!deleted) {
      throw new NotFoundError('Categoría no encontrada');
    }

    res.status(200).json({
      success: true,
      data: null,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene estructura de árbol de categorías
 */
export const getCategoryTree = async (req, res, next) => {
  try {
    const tree = await CategoryService.getCategoryTree();

    res.status(200).json({
      success: true,
      data: tree,
      message: 'Árbol de categorías obtenido exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene categorías raíz (nivel 0)
 */
export const getRootCategories = async (req, res, next) => {
  try {
    const categories = await CategoryService.getRootCategories();

    res.status(200).json({
      success: true,
      data: categories,
      message: 'Categorías raíz obtenidas exitosamente'
    });
  } catch (error) {
    next(error);
  }
};