import { Request, Response } from 'express';
import Category from '../models/Category';

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.find({}).sort({ order: 1 });
        res.json({ success: true, categories });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, slug, description, image } = req.body;
        const category = await Category.create({ name, slug, description, image });
        res.status(201).json({ success: true, category });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};
export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
        
        if (category) {
            res.json({ success: true, category });
        } else {
            res.status(404).json({ success: false, message: 'Category not found' });
        }
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndDelete(id);
        
        if (category) {
            res.json({ success: true, message: 'Category deleted' });
        } else {
            res.status(404).json({ success: false, message: 'Category not found' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const reorderCategories = async (req: Request, res: Response) => {
    try {
        const { orderedIds } = req.body as { orderedIds: string[] };
        const bulkOps = orderedIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { order: index } },
            },
        }));
        await Category.bulkWrite(bulkOps);
        res.json({ success: true, message: 'Order saved' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
