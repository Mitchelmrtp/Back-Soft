import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
    getResources,
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
    getUserResources,
    getResourcesByCategory,
    uploadResource,
    updateResourceStatus,
    getResourceStats,
    searchResources,
    incrementViews,
    downloadResource
} from '../controllers/resourceController.js';
import {
    createComment,
    getResourceComments,
    deleteResourceComment,
    getCommentStats,
    createOrUpdateRating,
    getResourceRatingStats,
    getUserRating,
    deleteUserRating
} from '../controllers/commentController.js';
import authMiddleware, { optionalAuth } from '../middleware/authMiddleware.js';
import { validateComment } from '../validators/commentValidator.js';
import { validateRating } from '../validators/ratingValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.use((req, res, next) => {
    console.log('🛣️ RESOURCE ROUTE REQUEST:', {
        method: req.method,
        url: req.url,
        fullPath: req.originalUrl,
        hasAuth: !!req.headers.authorization
    });
    next();
});

const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resource-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF, Word o imágenes'));
        }
    }
});

// 🌍 Public routes (no authentication required)
router.get('/', optionalAuth, getResources);              // GET /resources
router.get('/search', searchResources);                   // GET /resources/search?q=query
router.get('/stats', getResourceStats);                   // GET /resources/stats
router.get('/:id', optionalAuth, getResourceById);        // GET /resources/:id
router.get('/:id/download', downloadResource);            // GET /resources/:id/download
router.post('/:id/view', incrementViews);                 // POST /resources/:id/view

// 🔒 Protected routes (authentication required)
router.post('/', authMiddleware, createResource);                           // POST /resources
router.post('/upload', authMiddleware, upload.single('file'), uploadResource);   // POST /resources/upload
router.put('/:id', authMiddleware, updateResource);                         // PUT /resources/:id
router.delete('/:id', authMiddleware, deleteResource);                      // DELETE /resources/:id

// 👤 User-specific routes
router.get('/my/resources', authMiddleware, getUserResources);         // GET /resources/my/resources

// 🏷️ Category routes
router.get('/category/:categoryId', getResourcesByCategory);           // GET /resources/category/:categoryId

// 🛡️ Admin/Moderation routes
router.patch('/:id/status', authMiddleware, updateResourceStatus);     // PATCH /resources/:id/status

// =============================================================================
// 💬 COMMENT ROUTES FOR RESOURCES
// =============================================================================

// Get comments for a specific resource
router.get('/:id/comments', getResourceComments);                      // GET /resources/:id/comments
router.get('/:id/comments/stats', getCommentStats);
router.post('/:id/comments', authMiddleware, validateComment, createComment);
router.delete('/:id/comments/:commentId', authMiddleware, deleteResourceComment);

router.get('/:id/rating-stats', getResourceRatingStats);
router.post('/:id/rating', authMiddleware, validateRating, createOrUpdateRating);
router.get('/:id/my-rating', authMiddleware, getUserRating);
router.delete('/:id/my-rating', authMiddleware, deleteUserRating);

export default router;