import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getDashboardStats } from '../controllers/dashboard.controller';

const router = Router();

// GET /api/dashboard/stats - Get dashboard stats for the current user
router.get('/stats', authenticateToken, getDashboardStats);

export default router;
