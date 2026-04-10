import { Request, Response } from 'express';
import Coupon from '../models/Coupon';

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActiveCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find({ 
      isActive: true, 
      expiryDate: { $gt: new Date() } 
    }).sort({ createdAt: -1 });
    
    // Only return available ones where usage hasn't exceeded limits
    const available = coupons.filter(c => c.usageLimit === 0 || c.usageCount < c.usageLimit);
    
    // Strip out some sensitive fields if needed, but since it's just code/discount, it's fine.
    res.json({ success: true, coupons: available });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error: any) {
    console.error("Create Coupon Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyCoupon = async (req: Request, res: Response) => {
  try {
    const { code, orderValue } = req.body;
    
    if (!code || orderValue === undefined) {
      return res.status(400).json({ success: false, message: 'Code and order value are required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
    }

    if (orderValue < coupon.minPurchase) {
      return res.status(400).json({ success: false, message: `Minimum purchase of ₹${coupon.minPurchase} required` });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderValue * coupon.discountAmount) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'flat') {
      discount = coupon.discountAmount;
    }

    // Ensure discount doesn't exceed order value
    if (discount > orderValue) {
      discount = orderValue;
    }

    res.json({ success: true, discount, coupon: { code: coupon.code, discountType: coupon.discountType, discountAmount: coupon.discountAmount } });
  } catch (error: any) {
    console.error("Apply Coupon Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
