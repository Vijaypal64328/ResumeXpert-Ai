// Routes for monitoring AI usage and quota consumption
import { Router } from 'express';
import { getUsageStats, resetUsageCounter } from '../controllers/usage.controller';

const router = Router();

// Get current usage statistics
router.get('/stats', getUsageStats);

// Reset daily usage counter (useful for testing or manual reset)
router.post('/reset', resetUsageCounter);

export default router;
