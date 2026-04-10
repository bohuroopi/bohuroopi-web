import express from 'express';
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign, dispatchCampaign } from '../controllers/campaignController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect as any, admin as any, getCampaigns);
router.post('/', protect as any, admin as any, createCampaign);
router.put('/:id', protect as any, admin as any, updateCampaign);
router.delete('/:id', protect as any, admin as any, deleteCampaign);
router.post('/:id/send', protect as any, admin as any, dispatchCampaign);

export default router;
