import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Resource = sequelize.define('Resource', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 200],
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 2000],
      notEmpty: true
    }
  },
  content: {
    type: DataTypes.TEXT
  },
  type: {
    type: DataTypes.ENUM('document', 'video', 'image', 'audio', 'link', 'presentation', 'spreadsheet', 'other'),
    allowNull: false,
    defaultValue: 'document'
  },
  format: {
    type: DataTypes.STRING // pdf, docx, mp4, jpg, etc.
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  file_path: {
    type: DataTypes.STRING
  },
  file_size: {
    type: DataTypes.INTEGER // in bytes
  },
  thumbnail_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived', 'under_review', 'rejected'),
    allowNull: false,
    defaultValue: 'draft'
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private', 'restricted'),
    allowNull: false,
    defaultValue: 'public'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // Academic-specific fields
  academic_year: {
    type: DataTypes.INTEGER,
    validate: {
      min: 2020,
      max: 2050
    }
  },
  semester: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 12
    }
  },
  topic: {
    type: DataTypes.STRING,
    validate: {
      len: [3, 200]
    }
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'es',
    validate: {
      len: [2, 5]
    }
  },
  views_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  downloads_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rating_average: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.0
  },
  rating_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  published_at: {
    type: DataTypes.DATE
  },
  archived_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'resources',
  timestamps: true,
  underscored: true,
  paranoid: true,
  indexes: [
    { fields: ['title'] },
    { fields: ['type'] },
    { fields: ['status'] },
    { fields: ['visibility'] },
    { fields: ['featured'] },
    { fields: ['published_at'] },
    { fields: ['created_at'] },
    { fields: ['user_id'] },
    { fields: ['category_id'] },
    { fields: ['course_id'] },
    { fields: ['academic_year'] },
    { fields: ['semester'] }
  ]
});

// Instance methods
Resource.prototype.incrementViews = async function() {
  this.views_count += 1;
  return await this.save();
};

Resource.prototype.incrementDownloads = async function() {
  this.downloads_count += 1;
  return await this.save();
};

Resource.prototype.updateRating = async function(newRating) {
  const totalRating = (this.rating_average * this.rating_count) + newRating;
  this.rating_count += 1;
  this.rating_average = totalRating / this.rating_count;
  return await this.save();
};

Resource.prototype.isPublished = function() {
  return this.status === 'published' && this.published_at <= new Date();
};

Resource.prototype.isVisible = function() {
  return this.visibility === 'public' && this.isPublished();
};

// Class methods
Resource.getPublished = function() {
  return this.findAll({
    where: {
      status: 'published',
      visibility: 'public',
      published_at: {
        [sequelize.Sequelize.Op.lte]: new Date()
      }
    },
    order: [['published_at', 'DESC']]
  });
};

Resource.getFeatured = function() {
  return this.findAll({
    where: {
      featured: true,
      status: 'published',
      visibility: 'public'
    },
    limit: 10,
    order: [['published_at', 'DESC']]
  });
};

export default Resource;