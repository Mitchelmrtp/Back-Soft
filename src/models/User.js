import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100],
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255],
      notEmpty: true
    }
  },
  first_name: {
    type: DataTypes.STRING,
    validate: {
      len: [1, 50]
    }
  },
  last_name: {
    type: DataTypes.STRING,
    validate: {
      len: [1, 50]
    }
  },
  telephone: {
    type: DataTypes.STRING,
    validate: {
      len: [10, 15]
    }
  },
  role: {
    type: DataTypes.ENUM('student', 'teacher', 'admin', 'moderator'),
    allowNull: false,
    defaultValue: 'student'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending_verification'),
    allowNull: false,
    defaultValue: 'pending_verification'
  },
  avatar_url: {
    type: DataTypes.STRING,
    validate: {
      isValidAvatarUrl(value) {
        if (value) {
          // Accept full URLs (http/https) or local paths starting with /
          if (!/^(https?:\/\/|\/uploads\/)/.test(value)) {
            throw new Error('Avatar URL must be a valid URL or upload path');
          }
        }
      }
    }
  },
  bio: {
    type: DataTypes.TEXT
  },
  // University-specific fields
  student_id: {
    type: DataTypes.STRING,
    unique: true,
    validate: {
      len: [6, 15]
    }
  },
  employee_id: {
    type: DataTypes.STRING,
    unique: true,
    validate: {
      len: [4, 15]
    }
  },
  academic_degree: {
    type: DataTypes.ENUM('bachelor', 'master', 'doctorate', 'postdoc'),
    defaultValue: null
  },
  department: {
    type: DataTypes.STRING,
    validate: {
      len: [3, 100]
    }
  },
  position: {
    type: DataTypes.STRING,
    validate: {
      len: [3, 100]
    }
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  last_login_at: {
    type: DataTypes.DATE
  },
  email_verified_at: {
    type: DataTypes.DATE
  },
  reset_password_token: {
    type: DataTypes.STRING
  },
  reset_password_expires: {
    type: DataTypes.DATE
  },
  verification_token: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  paranoid: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['role'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
});

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Instance methods
User.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.getFullName = function() {
  if (this.first_name && this.last_name) {
    return `${this.first_name} ${this.last_name}`;
  }
  return this.name;
};

User.prototype.toSafeObject = function() {
  const { password, reset_password_token, verification_token, ...safeUser } = this.toJSON();
  return safeUser;
};

// Class methods
User.generateVerificationToken = function() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export default User;