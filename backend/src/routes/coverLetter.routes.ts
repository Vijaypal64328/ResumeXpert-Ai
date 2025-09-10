
import { Router } from 'express';
import { generateCoverLetterController, getCoverLettersForUser, deleteCoverLetter } from '../controllers/coverLetter.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
// DELETE /api/cover-letter/:id - Delete a cover letter
router.delete('/:id', authenticateToken, deleteCoverLetter);

// GET /api/cover-letter - Get all cover letters for the authenticated user
router.get('/', authenticateToken, getCoverLettersForUser);

// POST /api/cover-letter/generate - Generate a cover letter
router.post('/generate', authenticateToken, generateCoverLetterController);

export default router;