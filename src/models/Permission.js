import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Simplified permission model for university repository
const Permission = sequelize.define('Permission', {
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
      len: [3, 50],
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT
  },
  // Simple permission types for university repository
  permission_type: {
    type: DataTypes.ENUM(
      'upload_resource',        // Subir recursos
      'moderate_resources',     // Moderar recursos
      'manage_courses',         // Gestionar cursos
      'manage_users',          // Gestionar usuarios
      'view_analytics',        // Ver estadísticas
      'delete_resources'       // Eliminar recursos
    ),
    allowNull: false
  },
  // Roles that have this permission by default
  default_roles: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'permissions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['permission_type'] },
    { fields: ['status'] }
  ]
});

// Class methods for university permissions
Permission.getByRole = function(role) {
  return this.findAll({
    where: {
      default_roles: { [sequelize.Sequelize.Op.contains]: [role] },
      status: 'active'
    }
  });
};

Permission.createDefaultPermissions = async function() {
  const defaultPerms = [
    {
      name: 'Subir Recursos',
      permission_type: 'upload_resource',
      description: 'Permite subir recursos académicos',
      default_roles: ['student', 'teacher']
    },
    {
      name: 'Moderar Recursos',
      permission_type: 'moderate_resources', 
      description: 'Permite aprobar/rechazar recursos',
      default_roles: ['admin', 'moderator']
    },
    {
      name: 'Gestionar Cursos',
      permission_type: 'manage_courses',
      description: 'Permite crear y modificar cursos',
      default_roles: ['admin']
    },
    {
      name: 'Gestionar Usuarios',
      permission_type: 'manage_users',
      description: 'Permite administrar usuarios',
      default_roles: ['admin']
    }
  ];

  for (const perm of defaultPerms) {
    await this.findOrCreate({
      where: { permission_type: perm.permission_type },
      defaults: perm
    });
  }
};

export default Permission;