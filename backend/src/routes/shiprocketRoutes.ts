import express from 'express';
import { checkServiceability } from '../utils/shiprocket';

const router = express.Router();

// @desc    Check serviceability for a delivery pincode
// @route   GET /api/shiprocket/serviceability
// @access  Public
router.get('/serviceability', async (req, res) => {
    try {
        const { pincode, weight, cod } = req.query;

        if (!pincode) {
            return res.status(400).json({ success: false, message: 'Delivery pincode is required' });
        }

        const isCod = cod === '1' || cod === 'true';
        const weightNum = weight ? parseFloat(weight as string) : 0.5;

        const data = await checkServiceability(pincode as string, weightNum, isCod);
        
        // Return Shiprocket response safely
        res.json({
            success: true,
            data
        });
    } catch (error: any) {
        console.error("Serviceability Check Error:", error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: error.response?.data?.message || 'Failed to check serviceability',
            details: error.response?.data
        });
    }
});

export default router;
