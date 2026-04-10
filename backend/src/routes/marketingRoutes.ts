import express from 'express';
import { getAbandonedCarts, recoverCart } from '../controllers/marketingController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/abandoned-carts', protect as any, admin as any, getAbandonedCarts);
router.post('/abandoned-carts/recover', protect as any, admin as any, recoverCart);

// Other standalone marketing endpoints can go here

export default router;
