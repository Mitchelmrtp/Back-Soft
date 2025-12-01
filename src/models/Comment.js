import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 1000],
      notEmpty: true
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  resource_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'resources',
      key: 'id'
    }
  },
  parent_id: {
    type: DataTypes.UUID,
    references: {
      model: 'comments',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('published', 'pending', 'hidden', 'deleted'),
    allowNull: false,
    defaultValue: 'published'
  },
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Rating from 1 to 5 stars - only for top-level comments'
  }
}, {
  tableName: 'comments',
  timestamps: true,
  underscored: true,
  paranoid: true,
  indexes: [
    { fields: ['resource_id'] },
    { fields: ['user_id'] },
    { fields: ['parent_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
});

// Self-referencing association for replies
Comment.belongsTo(Comment, { 
  as: 'parent', 
  foreignKey: 'parent_id' 
});

Comment.hasMany(Comment, { 
  as: 'replies', 
  foreignKey: 'parent_id' 
});

// Instance methods
Comment.prototype.isReply = function() {
  return this.parent_id !== null;
};

Comment.prototype.getRepliesCount = async function() {
  return await Comment.count({
    where: {
      parent_id: this.id,
      status: 'published'
    }
  });
};

export default Comment;