import express from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Upload multiple images (admin only)
router.post('/', protect as any, admin as any, upload.array('images', 5), (req: any, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        const imageUrls = req.files.map((file: any) => ({
            url: file.path, 
            public_id: file.filename
        }));

        res.status(200).json({
            success: true,
            message: 'Images uploaded successfully',
            images: imageUrls
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Upload images for customers (e.g. avatar, return photos) - auth required but not admin
router.post('/customer', protect as any, upload.array('images', 5), (req: any, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        const imageUrls = (req.files as any[]).map((file) => ({
            url: file.path,
            public_id: file.filename
        }));

        res.status(200).json({
            success: true,
            message: 'Images uploaded successfully',
            images: imageUrls
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
