// Export all services for centralized access
// Following Barrel Export Pattern

// Core Services
export { default as AuthService } from './AuthService.js';
export { default as UserService } from './UserService.js';
export { default as ResourceService } from './ResourceService.js';
export { default as CategoryService } from './CategoryService.js';

// University Services  
export { default as FacultyService } from './FacultyService.js';
export { default as CareerService } from './CareerService.js';
export { default as CourseService } from './CourseService.js';
export { default as AcademicPeriodService } from './AcademicPeriodService.js';

// Feature Services
export { default as SearchService } from './SearchService.js';
export { default as FavoriteService } from './FavoriteService.js';
export { default as LikeService } from './LikeService.js';
export { default as HelpService } from './HelpService.js';

// Administrative Services
export { default as AdminService } from './AdminService.js';
export { default as StatsService } from './StatsService.js';
export { default as ModerationService } from './ModerationService.js';

// Utility Services
export { default as JwtService } from './JwtService.js';
export { default as ResourceInteractionService } from './ResourceInteractionService.js';
export { default as uploadService } from './uploadService.js';
export { default as validationService } from './validationService.js';