import { Request, Response } from 'express';
import Order from '../models/Order';
import crypto from 'crypto';
import { createShiprocketOrder } from '../utils/shiprocket';
import Settings from '../models/Settings';

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const query: any = {};
        
        if (status && status !== 'All') {
            query.status = status as string;
        }

        const orders = await Order.find(query)
            .populate('user', 'id name email phone')
            .populate('orderItems.product', 'slug')
            .sort('-createdAt');
            
        res.json({ success: true, count: orders.length, orders });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: any, res: Response) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, discountPrice } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No order items' });
        }

        // 1. Fetch Settings for fee calculation
        const settings = await Settings.findOne() || { shippingFee: 0, freeShippingThreshold: 0, codCharges: 0 };
        
        // 2. Calculate Prices
        const itemsPrice = orderItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
        const shippingPrice = itemsPrice >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
        const codPrice = paymentMethod === 'cod' ? settings.codCharges : 0;
        const totalPrice = itemsPrice + shippingPrice + codPrice - (discountPrice || 0);

        // 3. Create Order
        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            shippingPrice,
            codPrice,
            discountPrice: discountPrice || 0,
            couponCode: req.body.couponCode,
            totalPrice,
            isPaid: paymentMethod === 'cod' ? false : true,
            status: 'pending'
        });

        if (paymentMethod === 'cod') {
            order.paymentResult = {
                id: `COD-${crypto.randomBytes(6).toString('hex')}`,
                status: 'pending',
                update_time: new Date().toISOString()
            };
        }

        const createdOrder = await order.save();
        res.status(201).json({ success: true, order: createdOrder });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req: any, res: Response) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('orderItems.product', 'name image slug')
            .sort('-createdAt');
            
        res.json({ success: true, orders });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Request order cancellation
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const requestCancelOrder = async (req: any, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            // Check if the user owns this order
            if (order.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
            }

            if (order.status === 'delivered' || order.status === 'shipped') {
                return res.status(400).json({ success: false, message: `Cannot cancel a ${order.status} order` });
            }

            order.status = 'cancel_requested';
            const updatedOrder = await order.save();
            res.json({ success: true, order: updatedOrder });
        } else {
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update order to delivered
// @route   GET /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = 'delivered';
            order.deliveredAt = new Date();

            const updatedOrder = await order.save();
            res.json({ success: true, order: updatedOrder });
        } else {
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = status;
            if (status === 'delivered') {
                order.deliveredAt = new Date();
            }

            const updatedOrder = await order.save();
            res.json({ success: true, order: updatedOrder });
        } else {
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all cancellation requests
// @route   GET /api/orders/cancel-requests
// @access  Private/Admin
export const getCancelRequests = async (req: Request, res: Response) => {
    try {
        const requests = await Order.find({ status: 'cancel_requested' })
            .populate('user', 'name email phone')
            .sort('-updatedAt');
            
        res.json({ success: true, count: requests.length, requests });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve cancellation request
// @route   PUT /api/orders/:id/approve-cancel
// @access  Private/Admin
export const approveCancelRequest = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = 'cancelled';
            const updatedOrder = await order.save();
            res.json({ success: true, order: updatedOrder });
        } else {
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Ship order with Shiprocket
// @route   POST /api/orders/:id/shiprocket
// @access  Private/Admin
export const shipWithShiprocket = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email phone');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.shiprocketOrderId) {
            return res.status(400).json({ success: true, message: 'Order already pushed to Shiprocket', shiprocketOrderId: order.shiprocketOrderId });
        }

        const shiprocketResponse: any = await createShiprocketOrder(order);

        if (shiprocketResponse && shiprocketResponse.order_id) {
            order.shiprocketOrderId = shiprocketResponse.order_id;
            order.shiprocketShipmentId = shiprocketResponse.shipment_id;
            order.status = 'processing';
            await order.save();
            
            res.json({ 
                success: true, 
                message: 'Order pushed to Shiprocket successfully',
                shiprocketOrderId: shiprocketResponse.order_id,
                shiprocketShipmentId: shiprocketResponse.shipment_id
            });
        } else {
            res.status(400).json({ success: false, message: 'Shiprocket failed to create order', details: shiprocketResponse });
        }
    } catch (error: any) {
        console.error("Shiprocket Controller Error:", error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: error.response?.data?.message || error.message,
            errors: error.response?.data?.errors
        });
    }
};
