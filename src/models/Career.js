import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Career = sequelize.define('Career', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 150],
      notEmpty: true
    }
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 15],
      notEmpty: true,
      isUppercase: true
    }
  },
  description: {
    type: DataTypes.TEXT
  },
  degree_type: {
    type: DataTypes.ENUM('bachelor', 'master', 'doctorate', 'technical'),
    allowNull: false,
    defaultValue: 'bachelor'
  },
  duration_semesters: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 4,
      max: 20
    }
  },
  credits_required: {
    type: DataTypes.INTEGER,
    validate: {
      min: 100,
      max: 500
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    allowNull: false,
    defaultValue: 'active'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'careers',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['code'] },
    { fields: ['status'] },
    { fields: ['degree_type'] }
  ]
});

export default Career;