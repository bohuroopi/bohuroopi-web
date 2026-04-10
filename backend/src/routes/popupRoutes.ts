import express from 'express';
import {
  getPopups, 
  getActivePopup, 
  createPopup, 
  updatePopup, 
  deletePopup,
  bulkUpdateOrder
} from '../controllers/popupController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Public route to get active popup
router.get('/active', getActivePopup);

// Admin routes
router.get('/', protect as any, admin as any, getPopups);
router.put('/reorder', protect as any, admin as any, bulkUpdateOrder);
router.post('/', protect as any, admin as any, createPopup);
router.put('/:id', protect as any, admin as any, updatePopup);
router.delete('/:id', protect as any, admin as any, deletePopup);

export default router;
