import express from 'express';
import { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, getSimilarProducts } from '../controllers/productController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.get('/:slug/similar', getSimilarProducts);
router.post('/', protect as any, admin as any, createProduct);
router.put('/:id', protect as any, admin as any, updateProduct);
router.delete('/:id', protect as any, admin as any, deleteProduct);

export default router;
