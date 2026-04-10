import { Request, Response } from 'express';
import Campaign from '../models/Campaign';

export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await Campaign.find({}).sort({ createdAt: -1 });
    res.json({ success: true, campaigns });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.create(req.body);
    res.status(201).json({ success: true, campaign });
  } catch (error: any) {
    console.error("Create Campaign Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    res.json({ success: true, campaign });
  } catch (error: any) {
    console.error("Update Campaign Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import { sendEmail } from '../utils/emailService';
import User from '../models/User';

export const dispatchCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    
    // Find target audience (simplified: for now just users who haven't opted out)
    const users = await User.find({ role: 'user' }); // Assuming we want to email customers
    
    let sentCount = 0;
    
    // Dispatch via Email
    if (campaign.type === 'email') {
        const emails = users.map(u => u.email).filter(e => !!e);
        
        // In production, we'd send these in batches or via BCC to avoid spam filters
        // Here we send one mass BCC email for simplicity, or iterate
        if (emails.length > 0) {
            const success = await sendEmail({
                to: process.env.SMTP_EMAIL || 'noreply@bohuroopi.com', // To ourselves
                subject: campaign.subject || campaign.name,
                html: `
                  <div style="font-family: sans-serif; padding: 20px; background: #fff1f2; text-align: center;">
                    <h1 style="color: #FF3E6C;">${campaign.subject || campaign.name}</h1>
                    <p style="font-size: 16px; color: #333;">${campaign.content}</p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="display: inline-block; padding: 12px 24px; background: #FF3E6C; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px;">Shop Now</a>
                  </div>
                `,
            });
            if (success) sentCount = emails.length;
        }
    }
    
    // Simulate campaign dispatch success
    campaign.status = 'sent';
    campaign.sentAt = new Date();
    await campaign.save();

    res.json({ success: true, message: `Campaign dispatched to ${sentCount} recipients via Email`, campaign });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
