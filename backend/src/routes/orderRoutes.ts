import express from 'express';
import { getOrders, updateOrderStatus, updateOrderToDelivered, createOrder, getMyOrders, requestCancelOrder, getCancelRequests, approveCancelRequest, shipWithShiprocket } from '../controllers/orderController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect as any, createOrder);
router.get('/myorders', protect as any, getMyOrders);
router.put('/:id/cancel', protect as any, requestCancelOrder);

// Admin routes
router.get('/cancel-requests', protect as any, admin as any, getCancelRequests);
router.get('/', protect as any, admin as any, getOrders);
router.put('/:id/approve-cancel', protect as any, admin as any, approveCancelRequest);
router.put('/:id/status', protect as any, admin as any, updateOrderStatus);
router.put('/:id/deliver', protect as any, admin as any, updateOrderToDelivered);
router.post('/:id/shiprocket', protect as any, admin as any, shipWithShiprocket);

export default router;
