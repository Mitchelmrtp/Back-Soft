import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 100],
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT
  },
  // Academic category type for university repository
  category_type: {
    type: DataTypes.ENUM(
      'subject_area',      // Área temática (Matemáticas, Ciencias, etc.)
      'document_type',     // Tipo de documento (Notas, Exámenes, etc.)
      'academic_level',    // Nivel académico (Básico, Intermedio, Avanzado)
      'resource_format'    // Formato del recurso (PDF, Video, etc.)
    ),
    allowNull: false,
    defaultValue: 'subject_area'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  resources_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'categories',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['category_type'] },
    { fields: ['status'] },
    { fields: ['sort_order'] }
  ]
});

// Class methods for university repository
Category.getByType = function(type) {
  return this.findAll({
    where: {
      category_type: type,
      status: 'active'
    },
    order: [['sort_order', 'ASC'], ['name', 'ASC']]
  });
};

Category.getSubjectAreas = function() {
  return this.getByType('subject_area');
};

Category.getDocumentTypes = function() {
  return this.getByType('document_type');
};

export default Category;