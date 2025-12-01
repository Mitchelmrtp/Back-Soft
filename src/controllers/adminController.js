// 🎮 Admin Controller - Request/Response Layer for Administrative Operations
// Following Controller Pattern and Single Responsibility Principle

import { Resource, User, Category, Course, Career, Faculty } from '../models/index.js';
import { Op } from 'sequelize';

// Middleware to check admin role
export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    next();
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalResources,
            totalCategories,
            publishedResources,
            pendingResources,
            recentUsers,
            recentResources
        ] = await Promise.all([
            User.count(),
            Resource.count(),
            Category.count(),
            Resource.count({ where: { status: 'published' } }),
            Resource.count({ where: { status: 'under_review' } }),
            User.count({ 
                where: {
                    created_at: {
                        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                    }
                }
            }),
            Resource.count({
                where: {
                    created_at: {
                        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                    }
                }
            })
        ]);

        res.success({
            stats: {
                users: {
                    total: totalUsers,
                    recent: recentUsers
                },
                resources: {
                    total: totalResources,
                    published: publishedResources,
                    pending: pendingResources,
                    recent: recentResources
                },
                categories: {
                    total: totalCategories
                }
            }
        }, 'Estadísticas obtenidas exitosamente');

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Get all users with pagination
export const getUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            status,
            role,
            sort = 'created_at',
            order = 'DESC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const whereClause = {};

        // Add filters
        if (status) whereClause.status = status;
        if (role) whereClause.role = role;

        // Add search
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { first_name: { [Op.iLike]: `%${search}%` } },
                { last_name: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            order: [[sort, order.toUpperCase()]],
            limit: parseInt(limit),
            offset
        });

        const totalPages = Math.ceil(count / parseInt(limit));

        res.success({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1
            }
        }, 'Usuarios obtenidos exitosamente');

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Update user (admin only)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const allowedFields = ['status', 'role', 'name', 'first_name', 'last_name'];
        
        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No se proporcionaron campos válidos para actualizar' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        await user.update(updates);

        // Get updated user without sensitive data
        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            first_name: user.first_name,
            last_name: user.last_name,
            created_at: user.created_at,
            updated_at: user.updated_at
        };

        res.success({
            user: safeUser
        }, 'Usuario actualizado exitosamente');

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Get all resources for moderation
export const getResourcesForModeration = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            type,
            sort = 'created_at',
            order = 'DESC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const whereClause = { deleted_at: null };

        if (status) whereClause.status = status;
        if (type) whereClause.type = type;

        const { count, rows: resources } = await Resource.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'category_type']
                }
            ],
            order: [[sort, order.toUpperCase()]],
            limit: parseInt(limit),
            offset
        });

        const totalPages = Math.ceil(count / parseInt(limit));

        res.success({
            resources,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1
            }
        }, 'Recursos obtenidos exitosamente');

    } catch (error) {
        console.error('Get resources for moderation error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Moderate resource (approve/reject)
export const moderateResource = async (req, res, next) => {
    try {
        console.log('🔍 Moderate Resource - Request params:', req.params);
        console.log('🔍 Moderate Resource - Request body:', req.body);
        console.log('🔍 Moderate Resource - User:', req.user);

        const { id } = req.params;
        const { status, reason } = req.body;

        // Validate status
        if (!status) {
            console.log('❌ Missing status field');
            return res.status(400).json({ 
                success: false,
                message: 'El campo status es requerido' 
            });
        }

        if (!['published', 'rejected', 'under_review'].includes(status)) {
            console.log('❌ Invalid status:', status);
            return res.status(400).json({ 
                success: false,
                message: 'Estado inválido. Valores permitidos: published, rejected, under_review' 
            });
        }

        const resource = await Resource.findByPk(id);
        if (!resource) {
            console.log('❌ Resource not found:', id);
            return res.status(404).json({ 
                success: false,
                message: 'Recurso no encontrado' 
            });
        }

        console.log('📦 Current resource status:', resource.status);
        console.log('🔄 Updating to status:', status);

        const updateData = { status };
        
        // Set published date if approved
        if (status === 'published' && resource.status !== 'published') {
            updateData.published_at = new Date();
        }

        // Add rejection reason to metadata
        if (status === 'rejected' && reason) {
            updateData.metadata = {
                ...resource.metadata,
                rejection_reason: reason,
                rejected_by: req.user.userId,
                rejected_at: new Date()
            };
        }

        await resource.update(updateData);
        console.log('✅ Resource updated successfully');

        return res.status(200).json({
            success: true,
            data: { resource },
            message: `Recurso ${status === 'published' ? 'aprobado' : status === 'rejected' ? 'rechazado' : 'actualizado'} exitosamente`
        });

    } catch (error) {
        console.error('❌ Moderate resource error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

// Get admin reports
export const getReports = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        
        const dateFilter = {};
        if (from && to) {
            dateFilter.created_at = {
                [Op.between]: [new Date(from), new Date(to)]
            };
        }
        
        const [userStats, resourceStats] = await Promise.all([
            User.count({ where: { ...dateFilter, deleted_at: null } }),
            Resource.count({ where: { ...dateFilter, deleted_at: null } })
        ]);
        
        const reports = {
            period: { from, to },
            users: userStats,
            resources: resourceStats
        };
        
        res.json(reports);
    } catch (error) {
        console.error('Get reports error:', error);
        res.error(error.message, 400);
    }
};