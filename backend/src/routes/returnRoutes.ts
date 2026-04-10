import express from 'express';
import { getReturns, updateReturnStatus, getReturnById, createReturn, getMyReturns } from '../controllers/returnController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect as any, createReturn);
router.get('/myreturns', protect as any, getMyReturns);

// Admin routes
router.route('/').get(protect as any, admin as any, getReturns);
router.route('/:id').get(protect as any, admin as any, getReturnById);
router.route('/:id/status').put(protect as any, admin as any, updateReturnStatus);

export default router;
