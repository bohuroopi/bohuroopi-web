import express from 'express';
import { initiatePhonePePayment, phonePeCallback } from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/phonepe/initiate', protect as any, initiatePhonePePayment);
router.post('/phonepe/callback/:transactionId', phonePeCallback);

export default router;
