import { Request, Response } from 'express';
import HomepageSection from '../models/Homepage';

export const getHomepageSections = async (req: Request, res: Response) => {
    try {
        const sections = await HomepageSection.find({}).sort('order');
        res.json({ success: true, sections });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createHomepageSection = async (req: Request, res: Response) => {
    try {
        const section = await HomepageSection.create(req.body);
        res.status(201).json({ success: true, section });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateHomepageSection = async (req: Request, res: Response) => {
    try {
        const section = await HomepageSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (section) {
            res.json({ success: true, section });
        } else {
            res.status(404).json({ success: false, message: 'Section not found' });
        }
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteHomepageSection = async (req: Request, res: Response) => {
    try {
        const section = await HomepageSection.findByIdAndDelete(req.params.id);
        if (section) {
            res.json({ success: true, message: 'Section deleted' });
        } else {
            res.status(404).json({ success: false, message: 'Section not found' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const bulkUpdateOrder = async (req: Request, res: Response) => {
    try {
        const { orders } = req.body; // Array of { _id, order }
        if (!Array.isArray(orders)) {
            return res.status(400).json({ success: false, message: 'Orders must be an array' });
        }

        const bulkOps = orders.map((item: any) => ({
            updateOne: {
                filter: { _id: item._id },
                update: { order: item.order }
            }
        }));

        await HomepageSection.bulkWrite(bulkOps);
        res.json({ success: true, message: 'Orders updated successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
