// Models index file - Establishes all model relationships for University Repository
import User from './User.js';
import Resource from './Resource.js';
import Category from './Category.js';
import Comment from './Comment.js';
import ResourceLike from './ResourceLike.js';
import Favorite from './Favorite.js';
import Permission from './Permission.js';
import UserPermission from './UserPermission.js';
import Report from './Report.js';
// University-specific models
import Faculty from './Faculty.js';
import Career from './Career.js';
import Course from './Course.js';
import AcademicPeriod from './AcademicPeriod.js';

// ===== USER RELATIONSHIPS =====
// User has many resources
User.hasMany(Resource, {
  foreignKey: 'user_id',
  as: 'resources'
});
Resource.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'author'
});

// User has many comments
User.hasMany(Comment, {
  foreignKey: 'user_id',
  as: 'comments'
});
Comment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'author'
});

// User has many resource likes
User.hasMany(ResourceLike, {
  foreignKey: 'user_id',
  as: 'likes'
});
ResourceLike.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// User has many favorites
User.hasMany(Favorite, {
  foreignKey: 'user_id',
  as: 'favorites'
});
Favorite.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// User permissions
User.belongsToMany(Permission, {
  through: UserPermission,
  foreignKey: 'user_id',
  otherKey: 'permission_id',
  as: 'permissions'
});
Permission.belongsToMany(User, {
  through: UserPermission,
  foreignKey: 'permission_id',
  otherKey: 'user_id',
  as: 'users'
});

// ===== RESOURCE RELATIONSHIPS =====
// Resource belongs to category
Resource.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});
Category.hasMany(Resource, {
  foreignKey: 'category_id',
  as: 'resources'
});

// Resource has many comments
Resource.hasMany(Comment, {
  foreignKey: 'resource_id',
  as: 'comments'
});
Comment.belongsTo(Resource, {
  foreignKey: 'resource_id',
  as: 'resource'
});

// Resource has many likes
Resource.hasMany(ResourceLike, {
  foreignKey: 'resource_id',
  as: 'likes'
});
ResourceLike.belongsTo(Resource, {
  foreignKey: 'resource_id',
  as: 'resource'
});

// Resource has many favorites
Resource.hasMany(Favorite, {
  foreignKey: 'resource_id',
  as: 'favorites'
});
Favorite.belongsTo(Resource, {
  foreignKey: 'resource_id',
  as: 'resource'
});

// Many-to-many: Users can like many resources
User.belongsToMany(Resource, {
  through: ResourceLike,
  foreignKey: 'user_id',
  otherKey: 'resource_id',
  as: 'likedResources'
});
Resource.belongsToMany(User, {
  through: ResourceLike,
  foreignKey: 'resource_id',
  otherKey: 'user_id',
  as: 'likedByUsers'
});

// Many-to-many: Users can favorite many resources
User.belongsToMany(Resource, {
  through: Favorite,
  foreignKey: 'user_id',
  otherKey: 'resource_id',
  as: 'favoriteResources'
});
Resource.belongsToMany(User, {
  through: Favorite,
  foreignKey: 'resource_id',
  otherKey: 'user_id',
  as: 'favoritedByUsers'
});

// ===== PERMISSION RELATIONSHIPS =====
User.hasMany(UserPermission, {
  foreignKey: 'user_id',
  as: 'userPermissions'
});
UserPermission.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Permission.hasMany(UserPermission, {
  foreignKey: 'permission_id',
  as: 'userPermissions'
});
UserPermission.belongsTo(Permission, {
  foreignKey: 'permission_id',
  as: 'permission'
});

// Granted by user relationship
UserPermission.belongsTo(User, {
  foreignKey: 'granted_by',
  as: 'grantor'
});

// ===== UNIVERSITY RELATIONSHIPS =====
// Faculty - Career relationships
Faculty.hasMany(Career, { 
  foreignKey: 'faculty_id', 
  as: 'careers',
  onDelete: 'SET NULL'
});
Career.belongsTo(Faculty, { 
  foreignKey: 'faculty_id', 
  as: 'faculty'
});

// Career - Course relationships  
Career.hasMany(Course, { 
  foreignKey: 'career_id', 
  as: 'courses',
  onDelete: 'SET NULL'
});
Course.belongsTo(Career, { 
  foreignKey: 'career_id', 
  as: 'career'
});

// User - Career relationships (for students)
Career.hasMany(User, { 
  foreignKey: 'career_id', 
  as: 'students',
  onDelete: 'SET NULL'
});
User.belongsTo(Career, { 
  foreignKey: 'career_id', 
  as: 'career'
});

// User - Faculty relationships (for teachers)
Faculty.hasMany(User, { 
  foreignKey: 'faculty_id', 
  as: 'faculty_members',
  onDelete: 'SET NULL'
});
User.belongsTo(Faculty, { 
  foreignKey: 'faculty_id', 
  as: 'faculty'
});

// Course - User relationships (teachers)
Course.belongsTo(User, { 
  foreignKey: 'teacher_id', 
  as: 'teacher'
});
User.hasMany(Course, { 
  foreignKey: 'teacher_id', 
  as: 'taught_courses'
});

// Resource - Course relationships
Resource.belongsTo(Course, { 
  foreignKey: 'course_id', 
  as: 'course',
  onDelete: 'SET NULL'
});
Course.hasMany(Resource, { 
  foreignKey: 'course_id', 
  as: 'resources'
});

// Resource - AcademicPeriod relationships
Resource.belongsTo(AcademicPeriod, { 
  foreignKey: 'academic_period_id', 
  as: 'academic_period',
  onDelete: 'SET NULL'
});
AcademicPeriod.hasMany(Resource, { 
  foreignKey: 'academic_period_id', 
  as: 'resources'
});

// ===== REPORT RELATIONSHIPS =====
// User has many reports (as reporter)
User.hasMany(Report, {
  foreignKey: 'user_id',
  as: 'reports'
});
Report.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'reporter'
});

// User has many reports resolved (as moderator)
User.hasMany(Report, {
  foreignKey: 'resolved_by',
  as: 'resolvedReports'
});
Report.belongsTo(User, {
  foreignKey: 'resolved_by',
  as: 'resolver'
});

// Resource has many reports
Resource.hasMany(Report, {
  foreignKey: 'resource_id',
  as: 'reports'
});
Report.belongsTo(Resource, {
  foreignKey: 'resource_id',
  as: 'resource'
});

export {
  User,
  Resource,
  Category,
  Comment,
  ResourceLike,
  Favorite,
  Permission,
  UserPermission,
  Report,
  Faculty,
  Career,
  Course,
  AcademicPeriod
};

export default {
  User,
  Resource,
  Category,
  Comment,
  ResourceLike,
  Favorite,
  Permission,
  UserPermission,
  Report,
  Faculty,
  Career,
  Course,
  AcademicPeriod
};