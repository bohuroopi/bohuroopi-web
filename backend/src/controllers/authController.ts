import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Admin from '../models/Admin';
import Order from '../models/Order';



const generateToken = (id: string, isAdmin: boolean = false) => {
    return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};


export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken((user._id as any).toString(), false),
            });
        } else {

            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const authUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            res.json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken((user._id as any).toString(), false),
            });
        } else {

            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const loginWithOTP = async (req: Request, res: Response) => {
    try {
        const { phone, otp } = req.body;

        // Static OTP check
        if (otp !== '123456') {
            return res.status(401).json({ success: false, message: 'Invalid OTP' });
        }

        let user = await User.findOne({ phone });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            user = await User.create({
                phone,
                name: 'Customer'
            });

        } else if (user.name === 'Customer' || !user.email) {
            // Also consider them "new" if they haven't set their profile yet
            isNewUser = true;
        }

        // Update lastLogin timestamp
        (user as any).lastLogin = new Date();
        await (user as any).save();

        res.json({
            success: true,
            _id: user._id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            isNewUser,
            token: generateToken((user._id as any).toString(), false),
        });


    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUserProfile = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Only update if non-empty string is provided
            if (req.body.name && req.body.name.trim()) user.name = req.body.name.trim();
            if (req.body.email && req.body.email.trim()) user.email = req.body.email.trim();
            // phone is NOT editable from profile — skip it entirely
            if (req.body.avatar !== undefined && req.body.avatar !== '') user.avatar = req.body.avatar;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                success: true,
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                avatar: updatedUser.avatar,
                token: generateToken((updatedUser._id as any).toString(), false),
            });

        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserProfile = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get saved addresses
// @route   GET /api/users/addresses
// @access  Private
export const getAddresses = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user._id).select('addresses');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, addresses: user.addresses || [] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Save a new address
// @route   POST /api/users/addresses
// @access  Private
export const saveAddress = async (req: any, res: Response) => {
    try {
        const { fullName, phone, street, city, state, zip, country, isDefault, type } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (isDefault) {
            user.addresses.forEach((a: any) => { a.isDefault = false; });
        }
        user.addresses.push({ fullName, phone, street, city, state: state || '', zip, country: country || 'India', isDefault: isDefault || false, type: type || 'Home' });
        await user.save();
        res.json({ success: true, addresses: user.addresses });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a saved address
// @route   DELETE /api/users/addresses/:index
// @access  Private
export const deleteAddress = async (req: any, res: Response) => {
    try {
        const index = parseInt(req.params.index);
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (index < 0 || index >= user.addresses.length) return res.status(400).json({ success: false, message: 'Invalid address index' });
        
        const deletedAddress = user.addresses[index];
        user.addresses.splice(index, 1);
        
        // If the deleted address was default, make the first one default (if any left)
        if (deletedAddress.isDefault && user.addresses.length > 0) {
           user.addresses[0].isDefault = true;
        }

        await user.save();
        res.json({ success: true, addresses: user.addresses });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Edit a saved address
// @route   PUT /api/users/addresses/:index
// @access  Private
export const editAddress = async (req: any, res: Response) => {
    try {
        const index = parseInt(req.params.index);
        const { fullName, phone, street, city, state, zip, country, isDefault, type } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (index < 0 || index >= user.addresses.length) return res.status(400).json({ success: false, message: 'Invalid address index' });

        if (isDefault) {
            user.addresses.forEach((a: any) => { a.isDefault = false; });
        }

        const addr = user.addresses[index] as any;
        addr.fullName = fullName;
        addr.phone = phone;
        addr.street = street;
        addr.city = city;
        addr.state = state || '';
        addr.zip = zip;
        addr.country = country || 'India';
        if (isDefault !== undefined) addr.isDefault = isDefault;
        if (type) addr.type = type;

        await user.save();
        res.json({ success: true, addresses: user.addresses });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Set default address
// @route   PUT /api/users/addresses/:index/default
// @access  Private
export const setDefaultAddress = async (req: any, res: Response) => {
    try {
        const index = parseInt(req.params.index);
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (index < 0 || index >= user.addresses.length) return res.status(400).json({ success: false, message: 'Invalid address index' });

        user.addresses.forEach((a: any, i: number) => {
            a.isDefault = (i === index);
        });

        await user.save();
        res.json({ success: true, addresses: user.addresses });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const syncCart = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.cart = req.body.cart;
            await user.save();
            res.json({ success: true, message: 'Cart synced' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error: any) {
        console.error("Cart sync failed:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({}).populate('cart.product', 'name price images').select('-password');
        res.json({ success: true, count: users.length, users });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('cart.product', 'name price images')
            .select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const orders = await Order.find({ user: req.params.id })
            .sort({ createdAt: -1 })
            .select('_id orderItems totalPrice status isPaid isDelivered createdAt shippingAddress');

        res.json({ success: true, user, orders });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const sendUserNotification = async (req: Request, res: Response) => {
    try {
        const { message, title } = req.body;
        const user = await User.findById(req.params.id).select('name phone email');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Placeholder: In production, integrate with FCM / SMS gateway etc.
        console.log(`[NOTIFY] Sending to ${user.name} (${user.phone || user.email}): ${title} - ${message}`);
        res.json({ success: true, message: `Notification sent to ${user.name}` });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Admin Auth Controllers
export const registerAdmin = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password } = req.body;
        const adminExists = await Admin.findOne({ 
            $or: [{ email }, { phone }] 
        });

        if (adminExists) {
            return res.status(400).json({ success: false, message: 'Admin with this email or phone already exists' });
        }

        const admin = await Admin.create({ name, email, phone, password });

        res.status(201).json({
            success: true,
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            token: generateToken((admin._id as any).toString(), true),
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const authAdmin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (admin && (await admin.comparePassword(password))) {
            res.json({
                success: true,
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                token: generateToken((admin._id as any).toString(), true),
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid admin credentials' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAdmins = async (req: Request, res: Response) => {
    try {
        const admins = await Admin.find({}).select('-password');
        res.json({ success: true, count: admins.length, admins });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteAdmin = async (req: Request, res: Response) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (admin) {
            // Prevent deleting the last admin if necessary, or just delete
            await Admin.findByIdAndDelete(req.params.id);
            res.json({ success: true, message: 'Admin removed' });
        } else {
            res.status(404).json({ success: false, message: 'Admin not found' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getWishlist = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist', 'name price discountPrice images slug');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, wishlist: user.wishlist });
    } catch (error: any) {
        console.error("Fetch wishlist failed:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addToWishlist = async (req: any, res: Response) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        (user.wishlist as any).addToSet(productId);
        await user.save();

        res.json({ success: true, message: 'Added to wishlist' });
    } catch (error: any) {
        console.error("Add to wishlist failed:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const removeFromWishlist = async (req: any, res: Response) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        (user.wishlist as any).pull(productId);
        await user.save();

        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (error: any) {
        console.error("Remove from wishlist failed:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
