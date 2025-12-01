// File upload service
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

// Create uploads directory if it doesn't exist
const createUploadsDir = async (dir) => {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        let uploadPath;
        
        switch (file.fieldname) {
            case 'resource_file':
                uploadPath = path.join(process.cwd(), 'public', 'uploads', 'resources');
                break;
            case 'thumbnail':
                uploadPath = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');
                break;
            case 'profile_picture':
                uploadPath = path.join(process.cwd(), 'public', 'uploads', 'profiles');
                break;
            default:
                uploadPath = path.join(process.cwd(), 'public', 'uploads', 'general');
        }
        
        await createUploadsDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        resource_file: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain'
        ],
        thumbnail: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp'
        ],
        profile_picture: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp'
        ]
    };

    const allowed = allowedTypes[file.fieldname] || allowedTypes.thumbnail;
    
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no permitido para ${file.fieldname}`), false);
    }
};

// Create multer instance
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
        files: 5 // Maximum 5 files per request
    }
});

// Delete file helper
export const deleteFile = async (filePath) => {
    try {
        if (filePath) {
            const fullPath = path.join(process.cwd(), 'public', filePath);
            await fs.unlink(fullPath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Delete file error:', error);
        return false;
    }
};

// Get file info
export const getFileInfo = async (filePath) => {
    try {
        const fullPath = path.join(process.cwd(), 'public', filePath);
        const stats = await fs.stat(fullPath);
        return {
            exists: true,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
        };
    } catch (error) {
        return {
            exists: false,
            error: error.message
        };
    }
};

// Process uploaded files
export const processUploadedFiles = (files) => {
    const processedFiles = {};
    
    Object.keys(files).forEach(fieldName => {
        const fileArray = Array.isArray(files[fieldName]) ? files[fieldName] : [files[fieldName]];
        
        processedFiles[fieldName] = fileArray.map(file => ({
            originalName: file.originalname,
            filename: file.filename,
            path: file.path.replace(/\\/g, '/').replace(process.cwd().replace(/\\/g, '/') + '/public', ''),
            size: file.size,
            mimetype: file.mimetype
        }));
        
        // If only one file, return object instead of array
        if (processedFiles[fieldName].length === 1) {
            processedFiles[fieldName] = processedFiles[fieldName][0];
        }
    });
    
    return processedFiles;
};