// 🌟 Favorite Model - Data Layer
// Following Active Record Pattern and Single Responsibility Principle

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  resource_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'resources',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'favorites',
  timestamps: true,
  paranoid: false, // No soft deletes for favorites
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'resource_id'], // Prevent duplicate favorites
      name: 'unique_user_resource_favorite'
    },
    {
      fields: ['user_id'], // Optimize queries by user
      name: 'idx_favorites_user_id'
    },
    {
      fields: ['resource_id'], // Optimize queries by resource
      name: 'idx_favorites_resource_id'
    }
  ]
});

// Define associations
Favorite.associate = (models) => {
  // A favorite belongs to a user
  Favorite.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE'
  });

  // A favorite belongs to a resource
  Favorite.belongsTo(models.Resource, {
    foreignKey: 'resource_id',
    as: 'resource',
    onDelete: 'CASCADE'
  });
};

export default Favorite;