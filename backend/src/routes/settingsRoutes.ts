import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getSettings);
router.put('/', protect as any, admin as any, updateSettings);

export default router;
