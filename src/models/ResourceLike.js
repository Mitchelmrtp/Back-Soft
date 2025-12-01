import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ResourceLike = sequelize.define('ResourceLike', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  }
}, {
  tableName: 'resource_likes',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'resource_id']
    },
    { fields: ['resource_id'] },
    { fields: ['user_id'] }
  ]
});

export default ResourceLike;