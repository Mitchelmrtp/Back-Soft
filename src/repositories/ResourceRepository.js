// 🏥️ Repository Pattern - Data Access Layer for Resources
// Following Repository Pattern and Single Responsibility Principle

import { Resource, Category, User, Comment, ResourceLike, Course, AcademicPeriod, Career, Faculty } from '../models/index.js';
import { Op } from 'sequelize';

class ResourceRepository {
  // Create new resource
  async create(resourceData) {
    try {
      return await Resource.create(resourceData);
    } catch (error) {
      throw new Error(`Error creating resource: ${error.message}`);
    }
  }

  // Find resource by ID with associations
  async findById(id, includeAssociations = true) {
    try {
      const includeOptions = includeAssociations ? [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'avatar_url', 'role', 'student_id', 'employee_id']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'description', 'category_type']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code', 'semester', 'credits'],
          include: [
            {
              model: Career,
              as: 'career',
              attributes: ['id', 'name', 'code'],
              include: [
                {
                  model: Faculty,
                  as: 'faculty',
                  attributes: ['id', 'name', 'code']
                }
              ]
            },
            {
              model: User,
              as: 'teacher',
              attributes: ['id', 'name', 'email', 'employee_id']
            }
          ]
        },
        {
          model: AcademicPeriod,
          as: 'academic_period',
          attributes: ['id', 'name', 'code', 'academic_year', 'period_number']
        },
        {
          model: Comment,
          as: 'comments',
          include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'avatar_url', 'role']
          }]
        },
        {
          model: ResourceLike,
          as: 'likes',
          attributes: ['user_id']
        }
      ] : [];

      return await Resource.findByPk(id, {
        include: includeOptions
      });
    } catch (error) {
      throw new Error(`Error finding resource: ${error.message}`);
    }
  }

  // Find all resources with filters and pagination
  async findAll(filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        category_id,
        type,
        user_id,
        course_id,
        academic_year,
        semester,
        search,
        sort = 'created_at',
        order = 'DESC',
        status = 'published'
      } = filters;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const whereClause = { status };

      // Apply filters
      if (category_id) whereClause.category_id = category_id;
      if (type) whereClause.type = type;
      if (user_id) whereClause.user_id = user_id;
      if (course_id) whereClause.course_id = course_id;
      if (academic_year) whereClause.academic_year = academic_year;
      if (semester) whereClause.semester = semester;

      // Apply search
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { content: { [Op.iLike]: `%${search}%` } },
          { topic: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Resource.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'email', 'avatar_url', 'role', 'student_id', 'employee_id']
          },
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'category_type']
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'name', 'code', 'semester'],
            include: [
              {
                model: Career,
                as: 'career',
                attributes: ['id', 'name', 'code']
              }
            ]
          },
          {
            model: AcademicPeriod,
            as: 'academic_period',
            attributes: ['id', 'name', 'code', 'academic_year']
          }
        ],
        order: [[sort, order.toUpperCase()]],
        limit: parseInt(limit),
        offset
      });

      return {
        resources: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      };
    } catch (error) {
      throw new Error(`Error fetching resources: ${error.message}`);
    }
  }

  // Update resource
  async update(id, updateData) {
    try {
      const [updatedCount] = await Resource.update(updateData, {
        where: { id }
      });

      if (updatedCount === 0) {
        throw new Error('Resource not found');
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating resource: ${error.message}`);
    }
  }

  // Delete resource (soft delete)
  async delete(id) {
    try {
      const deletedCount = await Resource.destroy({
        where: { id }
      });

      if (deletedCount === 0) {
        throw new Error('Resource not found');
      }

      return true;
    } catch (error) {
      throw new Error(`Error deleting resource: ${error.message}`);
    }
  }

  // Find resources by user ID
  async findByUserId(userId, filters = {}) {
    return await this.findAll({ ...filters, user_id: userId });
  }

  // Find resources by category
  async findByCategory(categoryId, filters = {}) {
    return await this.findAll({ ...filters, category_id: categoryId });
  }

  // Update resource status
  async updateStatus(id, status) {
    try {
      const [updatedCount] = await Resource.update(
        { status },
        { where: { id } }
      );

      if (updatedCount === 0) {
        throw new Error('Resource not found');
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating resource status: ${error.message}`);
    }
  }

  // Increment view count
  async incrementViews(id) {
    try {
      await Resource.increment('views_count', { where: { id } });
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error incrementing views: ${error.message}`);
    }
  }

  // Increment downloads count
  async incrementDownloads(id) {
    try {
      await Resource.increment('downloads_count', { where: { id } });
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error incrementing downloads: ${error.message}`);
    }
  }

  // Get resource statistics
  async getStats(userId = null) {
    try {
      const whereClause = userId ? { user_id: userId } : {};
      
      const stats = await Resource.findOne({
        where: whereClause,
        attributes: [
          [Resource.sequelize.fn('COUNT', Resource.sequelize.col('id')), 'total'],
          [Resource.sequelize.fn('SUM', Resource.sequelize.col('views_count')), 'totalViews'],
          [Resource.sequelize.fn('SUM', Resource.sequelize.col('likes_count')), 'totalLikes']
        ]
      });

      return stats?.dataValues || { total: 0, totalViews: 0, totalLikes: 0 };
    } catch (error) {
      throw new Error(`Error fetching stats: ${error.message}`);
    }
  }

  // Search resources with advanced filters
  async search(searchOptions) {
    try {
      const {
        searchTerm,
        categoryId,
        type,
        page = 1,
        limit = 20,
        sort = 'relevance',
        order = 'DESC',
        dateFrom,
        dateTo,
        status = 'published'
      } = searchOptions;

      const offset = (page - 1) * limit;
      const whereClause = { status };

      // Text search
      if (searchTerm) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { content: { [Op.iLike]: `%${searchTerm}%` } },
          { topic: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }

      // Add filters
      if (categoryId) {
        whereClause.category_id = categoryId;
      }

      if (type) {
        whereClause.type = type;
      }

      // Date filters
      if (dateFrom || dateTo) {
        whereClause.published_at = {};
        if (dateFrom) whereClause.published_at[Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.published_at[Op.lte] = new Date(dateTo);
      }

      // Sort order
      let orderBy;
      switch (sort) {
        case 'date':
          orderBy = [['published_at', order]];
          break;
        case 'title':
          orderBy = [['title', order]];
          break;
        case 'views':
          orderBy = [['views', order]];
          break;
        case 'likes':
          orderBy = [['likes_count', order]];
          break;
        default:
          orderBy = [['created_at', 'DESC']];
      }

      const result = await Resource.findAndCountAll({
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
        limit,
        offset,
        distinct: true
      });

      return {
        resources: result.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(result.count / limit),
          totalItems: result.count,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`Error searching resources: ${error.message}`);
    }
  }

  // Find resources by title pattern
  async findByTitlePattern(pattern, options = {}) {
    try {
      const { limit = 10, status = 'published', orderBy = [['views', 'DESC']] } = options;
      
      return await Resource.findAll({
        where: {
          status,
          title: { [Op.iLike]: `%${pattern}%` }
        },
        attributes: ['id', 'title', 'views'],
        limit,
        order: orderBy
      });
    } catch (error) {
      throw new Error(`Error finding resources by title pattern: ${error.message}`);
    }
  }

  // Find most viewed resources
  async findMostViewed(options = {}) {
    try {
      const { limit = 10, status = 'published' } = options;
      
      return await Resource.findAll({
        where: { status },
        attributes: ['id', 'title', 'views'],
        order: [['views', 'DESC']],
        limit
      });
    } catch (error) {
      throw new Error(`Error finding most viewed resources: ${error.message}`);
    }
  }

  // Advanced search with multiple filters
  async advancedSearch(searchOptions) {
    try {
      const {
        searchTerm,
        categoryIds = [],
        types = [],
        authorIds = [],
        dateFrom,
        dateTo,
        minViews,
        maxViews,
        page = 1,
        limit = 20,
        sort = 'relevance',
        order = 'DESC',
        status = 'published'
      } = searchOptions;

      const offset = (page - 1) * limit;
      const whereClause = { status };

      // Text search
      if (searchTerm && searchTerm.length >= 2) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { content: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }

      // Multiple filters
      if (categoryIds.length > 0) {
        whereClause.category_id = { [Op.in]: categoryIds };
      }

      if (types.length > 0) {
        whereClause.type = { [Op.in]: types };
      }

      if (authorIds.length > 0) {
        whereClause.user_id = { [Op.in]: authorIds };
      }

      // Date range filter
      if (dateFrom || dateTo) {
        whereClause.published_at = {};
        if (dateFrom) whereClause.published_at[Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.published_at[Op.lte] = new Date(dateTo);
      }

      // Views range filter
      if (minViews !== undefined || maxViews !== undefined) {
        whereClause.views = {};
        if (minViews !== undefined) whereClause.views[Op.gte] = minViews;
        if (maxViews !== undefined) whereClause.views[Op.lte] = maxViews;
      }

      // Sort order
      let orderBy;
      switch (sort) {
        case 'date':
          orderBy = [['published_at', order]];
          break;
        case 'title':
          orderBy = [['title', order]];
          break;
        case 'views':
          orderBy = [['views', order]];
          break;
        case 'likes':
          orderBy = [['likes_count', order]];
          break;
        default:
          orderBy = [['created_at', 'DESC']];
      }

      const result = await Resource.findAndCountAll({
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
        limit,
        offset,
        distinct: true
      });

      return {
        resources: result.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(result.count / limit),
          totalItems: result.count,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`Error in advanced search: ${error.message}`);
    }
  }

  // Get search statistics
  async getSearchStats() {
    try {
      const stats = await Resource.findOne({
        attributes: [
          [Resource.sequelize.fn('COUNT', Resource.sequelize.col('id')), 'total'],
          [Resource.sequelize.fn('COUNT', Resource.sequelize.literal("CASE WHEN status = 'published' THEN 1 END")), 'published'],
          [Resource.sequelize.fn('SUM', Resource.sequelize.col('views')), 'totalViews'],
          [Resource.sequelize.fn('AVG', Resource.sequelize.col('views')), 'averageViews']
        ]
      });

      return stats?.dataValues || { total: 0, published: 0, totalViews: 0, averageViews: 0 };
    } catch (error) {
      throw new Error(`Error getting search statistics: ${error.message}`);
    }
  }

  // Count all resources
  async count() {
    try {
      return await Resource.count();
    } catch (error) {
      throw new Error(`Error counting resources: ${error.message}`);
    }
  }

  // Count by status
  async countByStatus(status) {
    try {
      return await Resource.count({ where: { status } });
    } catch (error) {
      throw new Error(`Error counting resources by status: ${error.message}`);
    }
  }

  // Count recent resources (since a date)
  async countRecent(since) {
    try {
      return await Resource.count({
        where: {
          created_at: {
            [Op.gte]: since
          }
        }
      });
    } catch (error) {
      throw new Error(`Error counting recent resources: ${error.message}`);
    }
  }

  // Find all with details (for admin)
  async findAllWithDetails(options) {
    try {
      const defaultInclude = [
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
      ];

      const finalOptions = {
        ...options,
        include: options.includeAuthor || options.includeCategory ? defaultInclude : []
      };

      const { count, rows: resources } = await Resource.findAndCountAll(finalOptions);
      return { count, resources };
    } catch (error) {
      throw new Error(`Error finding resources with details: ${error.message}`);
    }
  }

  // Get resource submission statistics by date
  async getSubmissionStatsByDate(dateFrom, dateTo) {
    try {
      return await Resource.findAll({
        attributes: [
          [Resource.sequelize.fn('DATE', Resource.sequelize.col('created_at')), 'date'],
          [Resource.sequelize.fn('COUNT', Resource.sequelize.col('id')), 'count'],
          'status'
        ],
        where: {
          created_at: {
            [Op.between]: [dateFrom, dateTo]
          }
        },
        group: [
          Resource.sequelize.fn('DATE', Resource.sequelize.col('created_at')), 
          'status'
        ],
        order: [[Resource.sequelize.fn('DATE', Resource.sequelize.col('created_at')), 'DESC']]
      });
    } catch (error) {
      throw new Error(`Error getting submission stats: ${error.message}`);
    }
  }

  // Increment a numeric field
  async incrementField(id, fieldName, incrementBy = 1) {
    try {
      const resource = await Resource.findByPk(id);
      if (!resource) {
        throw new Error('Resource not found');
      }
      
      await resource.increment(fieldName, { by: incrementBy });
      return resource;
    } catch (error) {
      throw new Error(`Error incrementing field ${fieldName}: ${error.message}`);
    }
  }

  // Decrement a numeric field
  async decrementField(id, fieldName, decrementBy = 1) {
    try {
      const resource = await Resource.findByPk(id);
      if (!resource) {
        throw new Error('Resource not found');
      }
      
      await resource.decrement(fieldName, { by: decrementBy });
      return resource;
    } catch (error) {
      throw new Error(`Error decrementing field ${fieldName}: ${error.message}`);
    }
  }
}

export default new ResourceRepository();