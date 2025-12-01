import { Resource, Category, User } from '../models/index.js';
import { Op } from 'sequelize';

// Search resources
export const searchResources = async (req, res) => {
    try {
        const {
            q: searchQuery,
            category,
            type,
            page = 1,
            limit = 20,
            sort = 'relevance',
            order = 'DESC',
            dateFrom,
            dateTo
        } = req.query;

        if (!searchQuery || searchQuery.trim().length < 2) {
            return res.status(400).json({ message: 'La consulta de búsqueda debe tener al menos 2 caracteres' });
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const whereClause = {
            status: 'published' // Only search published resources
        };

        // Build search conditions
        const searchConditions = [];
        const searchTerm = searchQuery.trim();

        searchConditions.push(
            { title: { [Op.iLike]: `%${searchTerm}%` } },
            { description: { [Op.iLike]: `%${searchTerm}%` } },
            { content: { [Op.iLike]: `%${searchTerm}%` } },
            { topic: { [Op.iLike]: `%${searchTerm}%` } } // Search in topic field instead of non-existent tags
        );

        whereClause[Op.or] = searchConditions;

        // Add filters
        if (category) {
            whereClause.category_id = category;
        }

        if (type) {
            whereClause.type = type;
        }

        // Add date filters
        if (dateFrom || dateTo) {
            whereClause.published_at = {};
            if (dateFrom) whereClause.published_at[Op.gte] = new Date(dateFrom);
            if (dateTo) whereClause.published_at[Op.lte] = new Date(dateTo);
        }

        // Determine sort order
        let orderBy;
        switch (sort) {
            case 'date':
                orderBy = [['published_at', order.toUpperCase()]];
                break;
            case 'title':
                orderBy = [['title', order.toUpperCase()]];
                break;
            case 'views':
                orderBy = [['views', order.toUpperCase()]];
                break;
            case 'likes':
                orderBy = [['likes_count', order.toUpperCase()]];
                break;
            default: // 'relevance'
                orderBy = [['created_at', 'DESC']]; // Fallback to creation date
        }

        const { count, rows: resources } = await Resource.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'avatar_url']
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'category_type']
                }
            ],
            order: orderBy,
            limit: parseInt(limit),
            offset,
            distinct: true
        });

        const totalPages = Math.ceil(count / parseInt(limit));

        res.json({
            query: searchQuery,
            resources,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1
            },
            filters: {
                category,
                type,
                dateFrom,
                dateTo,
                sort,
                order
            }
        });

    } catch (error) {
        console.error('Search resources error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Get search suggestions
export const getSearchSuggestions = async (req, res) => {
    try {
        const { q: query } = req.query;

        if (!query || query.trim().length < 2) {
            return res.json({ suggestions: [] });
        }

        const searchTerm = query.trim();

        // Get resource titles and categories as suggestions
        const [resourceSuggestions, categorySuggestions] = await Promise.all([
            Resource.findAll({
                where: {
                    status: 'published',
                    title: { [Op.iLike]: `%${searchTerm}%` }
                },
                attributes: ['id', 'title'],
                limit: 5,
                order: [['views_count', 'DESC']]
            }),
            Category.findAll({
                where: {
                    name: { [Op.iLike]: `%${searchTerm}%` }
                },
                attributes: ['id', 'name'],
                limit: 3
            })
        ]);

        const suggestions = [
            ...resourceSuggestions.map(r => ({
                type: 'resource',
                id: r.id,
                text: r.title,
                url: `/resources/${r.id}`
            })),
            ...categorySuggestions.map(c => ({
                type: 'category',
                id: c.id,
                text: c.name,
                url: `/search?category=${c.id}`
            }))
        ];

        res.json({ suggestions });

    } catch (error) {
        console.error('Get search suggestions error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Get popular search terms
export const getPopularSearches = async (req, res) => {
    try {
        // Get most viewed resources as popular searches
        const popularResources = await Resource.findAll({
            where: { status: 'published' },
            attributes: ['title', 'views_count'],
            order: [['views_count', 'DESC']],
            limit: 10
        });

        const popularSearches = popularResources.map(resource => ({
            term: resource.title,
            views: resource.views_count
        }));

        res.json({ popularSearches });

    } catch (error) {
        console.error('Get popular searches error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Advanced search with multiple filters
export const advancedSearch = async (req, res) => {
    try {
        const {
            query,
            categories = [],
            types = [],
            authors = [],
            dateFrom,
            dateTo,
            minViews,
            maxViews,
            page = 1,
            limit = 20,
            sort = 'relevance',
            order = 'DESC'
        } = req.body;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const whereClause = {
            status: 'published'
        };

        // Text search
        if (query && query.trim().length >= 2) {
            const searchTerm = query.trim();
            whereClause[Op.or] = [
                { title: { [Op.iLike]: `%${searchTerm}%` } },
                { description: { [Op.iLike]: `%${searchTerm}%` } },
                { content: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        // Category filter
        if (categories.length > 0) {
            whereClause.category_id = { [Op.in]: categories };
        }

        // Type filter
        if (types.length > 0) {
            whereClause.type = { [Op.in]: types };
        }

        // Author filter
        if (authors.length > 0) {
            whereClause.user_id = { [Op.in]: authors };
        }

        // Date range filter
        if (dateFrom || dateTo) {
            whereClause.published_at = {};
            if (dateFrom) whereClause.published_at[Op.gte] = new Date(dateFrom);
            if (dateTo) whereClause.published_at[Op.lte] = new Date(dateTo);
        }

        // Views range filter
        if (minViews !== undefined || maxViews !== undefined) {
            whereClause.views_count = {};
            if (minViews !== undefined) whereClause.views_count[Op.gte] = parseInt(minViews);
            if (maxViews !== undefined) whereClause.views_count[Op.lte] = parseInt(maxViews);
        }

        // Determine sort order
        let orderBy;
        switch (sort) {
            case 'date':
                orderBy = [['published_at', order.toUpperCase()]];
                break;
            case 'title':
                orderBy = [['title', order.toUpperCase()]];
                break;
            case 'views':
                orderBy = [['views_count', order.toUpperCase()]];
                break;
            case 'likes':
                orderBy = [['likes_count', order.toUpperCase()]];
                break;
            default:
                orderBy = [['created_at', 'DESC']];
        }

        const { count, rows: resources } = await Resource.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'avatar_url']
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'category_type']
                }
            ],
            order: orderBy,
            limit: parseInt(limit),
            offset,
            distinct: true
        });

        const totalPages = Math.ceil(count / parseInt(limit));

        res.json({
            resources,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1
            },
            appliedFilters: {
                query,
                categories,
                types,
                authors,
                dateFrom,
                dateTo,
                minViews,
                maxViews,
                sort,
                order
            }
        });

    } catch (error) {
        console.error('Advanced search error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
