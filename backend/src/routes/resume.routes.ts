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
    authenticateToken, // Ensure user is authenticated and req.user is set
    (req, res, next) => {
        upload.single('resumeFile')(req, res, (err: any) => {
            if (err) {
                // Multer error (e.g., invalid file type or too large)
                const msg = typeof err?.message === 'string' ? err.message : 'Invalid file upload';
                return res.status(400).json({ message: msg });
            }
            next();
        });
    },
    uploadResume // Process the uploaded file
);

// POST /api/resumes/:resumeId/analyze - Analyze a specific resume
router.post(
    '/:resumeId/analyze',
    authenticateToken, // Ensure user is authenticated and req.user is set
    analyzeResume // Call the analysis controller function
);


// GET /api/resumes/:resumeId - Get a single resume by ID (summary + analysis)
router.get(
    '/:resumeId',
    authenticateToken,
    getResumeById
);

// GET /api/resumes/:resumeId/download - Download the original or reconstructed resume
router.get(
    '/:resumeId/download',
    authenticateToken,
    downloadUploadedResume
);

// DELETE /api/resumes/:resumeId - Delete an uploaded resume
router.delete(
    '/:resumeId',
    authenticateToken,
    deleteUploadedResume
);

export default router; 