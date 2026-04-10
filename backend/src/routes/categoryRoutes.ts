import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory, reorderCategories } from '../controllers/categoryController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect as any, admin as any, createCategory);
router.put('/reorder', protect as any, admin as any, reorderCategories);
router.put('/:id', protect as any, admin as any, updateCategory);
router.delete('/:id', protect as any, admin as any, deleteCategory);

export default router;
