import express from 'express';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, applyCoupon, getActiveCoupons } from '../controllers/couponController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/active', getActiveCoupons); // Public/All users route
router.post('/apply', protect as any, applyCoupon);

router.get('/', protect as any, admin as any, getCoupons);
router.post('/', protect as any, admin as any, createCoupon);
router.put('/:id', protect as any, admin as any, updateCoupon);
router.delete('/:id', protect as any, admin as any, deleteCoupon);

export default router;
