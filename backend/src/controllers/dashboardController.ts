import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import Product from '../models/Product';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // 1. Total Revenue (Sum of all orders that aren't cancelled)
        const revenueAggregate = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueAggregate.length > 0 ? revenueAggregate[0].total : 0;

        // 2. Total Orders
        const totalOrders = await Order.countDocuments();

        // 3. Total Customers
        const totalCustomers = await User.countDocuments();

        // 4. Inventory Count
        const inventoryCount = await Product.countDocuments();

        // 5. Recent Orders (Last 5)
        const recentOrders = await Order.find()
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            stats: {
                totalRevenue,
                totalOrders,
                totalCustomers,
                inventoryCount
            },
            recentOrders: recentOrders.map(order => ({
                id: order._id,
                customer: (order.user as any)?.name || order.shippingAddress.fullName || 'Guest',
                date: order.createdAt,
                amount: order.totalPrice,
                status: order.status
            }))
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
