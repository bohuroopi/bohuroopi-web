import express from 'express';
import { getHomepageSections, createHomepageSection, updateHomepageSection, deleteHomepageSection, bulkUpdateOrder } from '../controllers/homepageController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getHomepageSections);
router.post('/', protect as any, admin as any, createHomepageSection);
router.put('/reorder', protect as any, admin as any, bulkUpdateOrder);
router.put('/:id', protect as any, admin as any, updateHomepageSection);
router.delete('/:id', protect as any, admin as any, deleteHomepageSection);

export default router;
