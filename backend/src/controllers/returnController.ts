import { Request, Response } from 'express';
import Return from '../models/Return';
import Order from '../models/Order';

// @desc    Create return request
// @route   POST /api/returns
// @access  Private
export const createReturn = async (req: any, res: Response) => {
    try {
        const { orderId, reason, description, images } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        if (order.status !== 'delivered') {
            return res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });
        }

        const existingReturn = await Return.findOne({ order: orderId, user: req.user._id });
        if (existingReturn) {
            return res.status(400).json({ success: false, message: 'Return request already submitted for this order' });
        }

        const items = order.orderItems.map((item: any) => ({
            product: item.product,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            reason: reason,
            image: item.image,
        }));

        const returnRequest = new Return({
            order: orderId,
            user: req.user._id,
            items,
            description,
            images: images || [],
        });

        const createdReturn = await returnRequest.save();
        res.status(201).json({ success: true, returnRequest: createdReturn });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get logged in user's return requests
// @route   GET /api/returns/myreturns
// @access  Private
export const getMyReturns = async (req: any, res: Response) => {
    try {
        const returns = await Return.find({ user: req.user._id })
            .populate('order', 'totalPrice createdAt')
            .sort('-createdAt');
        res.json({ success: true, returns });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all return requests
// @route   GET /api/returns
// @access  Private/Admin
export const getReturns = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const query: any = {};
        
        if (status && status !== 'All') {
            query.status = status as string;
        }

        const returns = await Return.find(query)
            .populate('user', 'id name email phone')
            .populate('order', 'id createdAt')
            .populate('items.product', 'name slug images')
            .sort('-createdAt');
            
        res.json({ success: true, count: returns.length, returns });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update return status
// @route   PUT /api/returns/:id/status
// @access  Private/Admin
export const updateReturnStatus = async (req: Request, res: Response) => {
    try {
        const { status, adminComment, refundAmount } = req.body;
        const returnRequest = await Return.findById(req.params.id);

        if (returnRequest) {
            if (status) returnRequest.status = status;
            if (adminComment) returnRequest.adminComment = adminComment;
            if (refundAmount !== undefined) returnRequest.refundAmount = refundAmount;

            const updatedReturn = await returnRequest.save();
            res.json({ success: true, returnRequest: updatedReturn });
        } else {
            res.status(404).json({ success: false, message: 'Return request not found' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get return details
// @route   GET /api/returns/:id
// @access  Private/Admin
export const getReturnById = async (req: Request, res: Response) => {
    try {
        const returnRequest = await Return.findById(req.params.id)
            .populate('user', 'id name email phone')
            .populate('order')
            .populate('items.product');

        if (returnRequest) {
            res.json({ success: true, returnRequest });
        } else {
            res.status(404).json({ success: false, message: 'Return request not found' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
