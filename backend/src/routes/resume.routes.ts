import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
// Import controller and multer config
import { uploadResume, analyzeResume, getUploadedResumes, downloadUploadedResume, deleteUploadedResume, getResumeById } from '../controllers/resume.controller';
import upload from '../config/multer.config'; // Import the configured multer instance

const router = Router();

// GET /api/resumes - Get list of uploaded resumes for the user
router.get(
    '/', // Root path relative to /api/resumes
    authenticateToken,
    getUploadedResumes
);

// POST /api/resumes/upload - Upload and parse a resume
router.post(
    '/upload',
    authenticateToken,
    upload.single('resumeFile'), // Handle single file upload named 'resumeFile'
    uploadResume // Process the uploaded file
);

// POST /api/resumes/:resumeId/analyze - Analyze a specific resume
router.post(
    '/:resumeId/analyze',
    authenticateToken,
    analyzeResume // Call the analysis controller function
);

// GET /api/resumes/:resumeId - Get resume details and analysis if present
router.get(
    '/:resumeId',
    authenticateToken,
    getResumeById
);

// GET /api/resumes/:resumeId/download - Download uploaded resume as PDF
router.get(
    '/:resumeId/download',
    authenticateToken,
    downloadUploadedResume
);

// DELETE /api/resumes/:resumeId - Delete uploaded resume
router.delete(
    '/:resumeId',
    authenticateToken,
    deleteUploadedResume
);

// TODO: Add other resume routes later (e.g., GET /api/resumes/:id)

export default router; 