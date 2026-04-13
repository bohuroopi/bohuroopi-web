import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/stats', protect as any, admin as any, getDashboardStats);

export default router;
