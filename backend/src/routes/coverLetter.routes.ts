
import { Router } from 'express';
import { generateCoverLetterController, getCoverLettersForUser, deleteCoverLetter } from '../controllers/coverLetter.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
// DELETE /api/cover-letter/:id - Delete a cover letter
router.delete('/:id', requireAuth, deleteCoverLetter);

// GET /api/cover-letter - Get all cover letters for the authenticated user
router.get('/', requireAuth, getCoverLettersForUser);

// POST /api/cover-letter/generate - Generate a cover letter
router.post('/generate', requireAuth, generateCoverLetterController);

export default router;