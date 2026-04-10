import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { category, categories, ids, occasion, style, minPrice, maxPrice, sort, search } = req.query;

        const query: any = {};

        if (category) {
            const cat = await Category.findOne({ slug: category as string });
            if (cat) query.category = cat._id;
        }

        if (categories) {
            query.category = { $in: (categories as string).split(',') };
        }

        if (ids) {
            query._id = { $in: (ids as string).split(',') };
        }

        if (occasion) query.occasion = { $in: (occasion as string).split(',') };
        if (style) query.style = { $in: (style as string).split(',') };
        
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (search) {
            query.name = { $regex: search as string, $options: 'i' };
        }

        let productsQuery = Product.find(query).populate('category', 'name slug');

        if (sort) {
            const sortStr = (sort as string).split(',').join(' ');
            productsQuery = productsQuery.sort(sortStr);
        } else {
            productsQuery = productsQuery.sort('-createdAt');
        }

        const products = await productsQuery;
        res.json({ success: true, count: products.length, products });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProductBySlug = async (req: Request, res: Response) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');
        if (product) {
            res.json({ success: true, product });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = new Product(req.body);
        const createdProduct = await product.save();
        res.status(201).json({ success: true, product: createdProduct });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
        
        if (product) {
            res.json({ success: true, product });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        
        if (product) {
            res.json({ success: true, message: 'Product deleted' });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSimilarProducts = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const product = await Product.findOne({ slug });
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        let similarProducts: any[] = [];

        // 1. Try matching by tags (if tags exist)
        if (product.tags && product.tags.length > 0) {
            similarProducts = await Product.find({
                _id: { $ne: product._id },
                tags: { $in: product.tags }
            }).limit(5).populate('category', 'name slug');
        }

        // 2. Fallback to same category if not enough matches
        if (similarProducts.length < 5) {
            const remainingCount = 5 - similarProducts.length;
            const categoryProducts = await Product.find({
                _id: { $ne: product._id, $nin: similarProducts.map(p => p._id) },
                category: product.category
            }).limit(remainingCount).populate('category', 'name slug');
            
            similarProducts = [...similarProducts, ...categoryProducts];
        }

        // 3. Last fallback: any other products if still not enough
        if (similarProducts.length < 5) {
            const remainingCount = 5 - similarProducts.length;
            const otherProducts = await Product.find({
                _id: { $ne: product._id, $nin: similarProducts.map(p => p._id) }
            }).limit(remainingCount).populate('category', 'name slug');

            similarProducts = [...similarProducts, ...otherProducts];
        }

        res.json({ success: true, products: similarProducts });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};


