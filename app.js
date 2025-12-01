import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import uploadConfig from './src/config/upload.js';

import authRoutes from './src/routes/authRoutes.js';
import resourceRoutes from './src/routes/resourceRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import searchRoutes from './src/routes/searchRoutes.js';
import helpRoutes from './src/routes/helpRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import favoriteRoutes from './src/routes/favoriteRoutes.js';
import likeRoutes from './src/routes/likeRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import facultyRoutes from './src/routes/facultyRoutes.js';
import careerRoutes from './src/routes/careerRoutes.js';
import courseRoutes from './src/routes/courseRoutes.js';
import academicPeriodRoutes from './src/routes/academicPeriodRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import commentRoutes from './src/routes/commentRoutes.js';

import { standardResponse, errorHandler } from './src/middleware/responseMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('upload', uploadConfig);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    message: 'Too many requests from this IP, please try again later.',
    skip: () => true
});

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            "frame-ancestors": ["'self'", "http://localhost:5000", "http://localhost:5173", "http://localhost:3000"],
            "frame-src": ["'self'", "http://localhost:5000", "http://localhost:5173", "http://localhost:3000"],
        },
    }
}));
app.use(limiter);
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5001',
        'http://localhost:5000', 
        'http://localhost:3000',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use(standardResponse);

app.use((req, res, next) => {
    console.log('🌍 GLOBAL REQUEST:', {
        method: req.method,
        originalUrl: req.originalUrl,
        baseUrl: req.baseUrl,
        path: req.path,
        headers: {
            host: req.headers.host,
            authorization: req.headers.authorization ? '***provided***' : 'none'
        }
    });
    next();
});

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/academic-periods', academicPeriodRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/comments', commentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.success({
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Global error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

export default app;