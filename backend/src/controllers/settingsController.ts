import { Request, Response } from 'express';
import Settings from '../models/Settings';

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create initial settings if they don't exist
      settings = await Settings.create({
        storeName: 'Bohuroopi',
        supportEmail: 'support@bohuroopi.com',
        supportPhone: '+91 9123456789',
        shippingFee: 0,
        freeShippingThreshold: 500,
        codCharges: 0,
        shippingSlabs: [],
        faqs: [],
      });
    }
    res.json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (settings) {
      settings = await Settings.findByIdAndUpdate(settings._id, req.body, { new: true, runValidators: true });
    } else {
      settings = await Settings.create(req.body);
    }
    res.json({ success: true, settings });
  } catch (error: any) {
    console.error('Update Settings Error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
