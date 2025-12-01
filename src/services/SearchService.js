// 🔧 Search Service - Business Logic Layer
// Following Service Layer Pattern and using Repository for data access

import ResourceRepository from '../repositories/ResourceRepository.js';
import CategoryRepository from '../repositories/CategoryRepository.js';

class SearchService {
  constructor(
    resourceRepository = ResourceRepository,
    categoryRepository = CategoryRepository
  ) {
    this.resourceRepository = resourceRepository;
    this.categoryRepository = categoryRepository;
  }

  // Search resources with filters
  async searchResources(searchParams) {
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
      } = searchParams;

      if (!searchQuery || searchQuery.trim().length < 2) {
        throw new Error('La consulta de búsqueda debe tener al menos 2 caracteres');
      }

      const searchOptions = {
        searchTerm: searchQuery.trim(),
        categoryId: category,
        type,
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        order: order.toUpperCase(),
        dateFrom,
        dateTo,
        status: 'published'
      };

      const result = await this.resourceRepository.search(searchOptions);

      return {
        query: searchQuery,
        resources: result.resources,
        pagination: result.pagination,
        filters: {
          category,
          type,
          dateFrom,
          dateTo,
          sort,
          order
        }
      };
    } catch (error) {
      throw new Error(`Error searching resources: ${error.message}`);
    }
  }

  // Get search suggestions
  async getSearchSuggestions(query) {
    try {
      if (!query || query.trim().length < 2) {
        return { suggestions: [] };
      }

      const searchTerm = query.trim();

      // Get resource titles as suggestions (using existing repository methods)
      const resourceSuggestions = await this.resourceRepository.findByTitlePattern(searchTerm, {
        limit: 5,
        status: 'published',
        orderBy: [['views', 'DESC']]
      });

      // Get category suggestions
      const categorySuggestions = await this.categoryRepository.findByNamePattern(searchTerm, {
        limit: 3
      });

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
          url: `/search?category=${c.slug}`
        }))
      ];

      return { suggestions };
    } catch (error) {
      throw new Error(`Error getting search suggestions: ${error.message}`);
    }
  }

  // Get popular search terms based on most viewed resources
  async getPopularSearches() {
    try {
      const popularResources = await this.resourceRepository.findMostViewed({
        limit: 10,
        status: 'published'
      });

      const popularSearches = popularResources.map(resource => ({
        term: resource.title,
        views: resource.views
      }));

      return { popularSearches };
    } catch (error) {
      throw new Error(`Error getting popular searches: ${error.message}`);
    }
  }

  // Advanced search with multiple filters
  async advancedSearch(searchFilters) {
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
      } = searchFilters;

      const searchOptions = {
        searchTerm: query?.trim(),
        categoryIds: categories,
        types,
        authorIds: authors,
        dateFrom,
        dateTo,
        minViews: minViews !== undefined ? parseInt(minViews) : undefined,
        maxViews: maxViews !== undefined ? parseInt(maxViews) : undefined,
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        order: order.toUpperCase(),
        status: 'published'
      };

      const result = await this.resourceRepository.advancedSearch(searchOptions);

      return {
        resources: result.resources,
        pagination: result.pagination,
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
      };
    } catch (error) {
      throw new Error(`Error performing advanced search: ${error.message}`);
    }
  }

  // Search resources by category
  async searchByCategory(categoryId, options = {}) {
    try {
      const searchOptions = {
        categoryId,
        status: 'published',
        ...options
      };

      return await this.resourceRepository.findByCategory(categoryId, searchOptions);
    } catch (error) {
      throw new Error(`Error searching by category: ${error.message}`);
    }
  }

  // Search resources by type
  async searchByType(type, options = {}) {
    try {
      const searchOptions = {
        type,
        status: 'published',
        ...options
      };

      return await this.resourceRepository.findByType(type, searchOptions);
    } catch (error) {
      throw new Error(`Error searching by type: ${error.message}`);
    }
  }

  // Search resources by author
  async searchByAuthor(authorId, options = {}) {
    try {
      const searchOptions = {
        authorId,
        status: 'published',
        ...options
      };

      return await this.resourceRepository.findByAuthor(authorId, searchOptions);
    } catch (error) {
      throw new Error(`Error searching by author: ${error.message}`);
    }
  }

  // Get search statistics
  async getSearchStats() {
    try {
      const stats = await this.resourceRepository.getSearchStats();
      
      return {
        totalResources: stats.total,
        totalPublished: stats.published,
        totalViews: stats.totalViews,
        averageViews: stats.averageViews
      };
    } catch (error) {
      throw new Error(`Error getting search statistics: ${error.message}`);
    }
  }
}

export default new SearchService();