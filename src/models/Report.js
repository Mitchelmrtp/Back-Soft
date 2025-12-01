// 🚨 Report Model - Resource Report System
// Following Single Responsibility Principle

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Report Model - Handles user reports on resources
 * Follows Single Responsibility Principle
 * Open/Closed Principle: Extensible for new report types
 */
const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Foreign keys
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'User who made the report'
  },
  
  resource_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Resource being reported'
  },
  
  // Report details
  type: {
    type: DataTypes.ENUM(
      'inappropriate_content',
      'copyright_violation', 
      'spam',
      'misleading_title',
      'wrong_category',
      'broken_file',
      'other'
    ),
    allowNull: false,
    comment: 'Type of report'
  },
  
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Detailed reason for the report'
  },
  
  additional_info: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional information or evidence'
  },
  
  // Report status and resolution
  status: {
    type: DataTypes.ENUM('pending', 'reviewing', 'resolved', 'dismissed'),
    defaultValue: 'pending',
    allowNull: false,
    comment: 'Current status of the report'
  },
  
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    allowNull: false,
    comment: 'Priority level based on report type'
  },
  
  // Resolution details
  resolved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Admin/Moderator who resolved the report'
  },
  
  resolution_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes from moderator about resolution'
  },
  
  action_taken: {
    type: DataTypes.ENUM(
      'no_action',
      'warning_issued',
      'content_removed',
      'user_suspended',
      'content_modified',
      'category_changed'
    ),
    allowNull: true,
    comment: 'Action taken after review'
  },
  
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the report was resolved'
  },
  
  // Metadata
  ip_address: {
    type: DataTypes.INET,
    allowNull: true,
    comment: 'IP address of reporter for abuse prevention'
  },
  
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Browser/device info for context'
  }
}, {
  tableName: 'reports',
  indexes: [
    {
      fields: ['resource_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['type']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['created_at']
    }
  ]
});

export default Report;