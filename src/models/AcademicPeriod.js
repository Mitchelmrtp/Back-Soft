import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AcademicPeriod = sequelize.define('AcademicPeriod', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 100],
      notEmpty: true
    }
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [4, 15],
      notEmpty: true
    }
  },
  type: {
    type: DataTypes.ENUM('semester', 'trimester', 'quarter', 'annual'),
    allowNull: false,
    defaultValue: 'semester'
  },
  academic_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 2020,
      max: 2050
    }
  },
  period_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 4
    }
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  enrollment_start: {
    type: DataTypes.DATEONLY
  },
  enrollment_end: {
    type: DataTypes.DATEONLY
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'active', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'upcoming'
  },
  is_current: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'academic_periods',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['code'] },
    { fields: ['academic_year'] },
    { fields: ['period_number'] },
    { fields: ['status'] },
    { fields: ['is_current'] },
    { fields: ['start_date'] },
    { fields: ['end_date'] }
  ]
});

export default AcademicPeriod;