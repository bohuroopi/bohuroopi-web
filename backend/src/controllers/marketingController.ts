import { Request, Response } from 'express';
import User from '../models/User';

export const getAbandonedCarts = async (req: Request, res: Response) => {
  try {
    // Find users with non-empty carts. 
    // In a real app we'd also check if Date.now() - updated_at > 24 hours and no recent orders.
    const users = await User.find({
      cart: { $exists: true, $not: { $size: 0 } },
    }).select('name email phone cart updatedAt').populate('cart.product', 'name price');

    res.json({ success: true, abandonedCarts: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recoverCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Simulate sending recovery email/SMS
    console.log(`[ABANDONED CART] Sent recovery message to ${user.email || user.phone}`);

    res.json({ success: true, message: 'Recovery message sent' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
