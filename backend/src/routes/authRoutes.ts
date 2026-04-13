import express from 'express';
import { 
    registerUser, 
    authUser, 
    getUserProfile, 
    getUsers,
    getUserById,
    deleteUser,
    sendUserNotification,
    syncCart, 
    loginWithOTP, 
    requestOTP,
    updateUserProfile,
    requestAdminOTP,
    loginAdminWithOTP,
    registerAdmin,
    getAdmins,
    deleteAdmin,
    getAddresses,
    saveAddress,
    deleteAddress,
    editAddress,
    setDefaultAddress,
    getWishlist,
    addToWishlist,
    removeFromWishlist
} from '../controllers/authController';
import { protect, admin, superAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// ─── Admin Auth (must be before wildcard /:id routes) ────────────────────────
router.post('/admin/request-otp', requestAdminOTP);
router.post('/admin/login-otp', loginAdminWithOTP);
router.post('/admin/register', protect as any, superAdmin as any, registerAdmin);
router.get('/admins', protect as any, superAdmin as any, getAdmins);
router.delete('/admins/:id', protect as any, superAdmin as any, deleteAdmin);

// ─── Store User Routes ────────────────────────────────────────────────────────
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/request-otp', requestOTP);
router.post('/login-otp', loginWithOTP);
router.get('/profile', protect as any, getUserProfile);
router.put('/profile', protect as any, updateUserProfile);
router.post('/cart-sync', protect as any, syncCart);
router.get('/addresses', protect as any, getAddresses);
router.post('/addresses', protect as any, saveAddress);
router.delete('/addresses/:index', protect as any, deleteAddress);
router.put('/addresses/:index', protect as any, editAddress);
router.put('/addresses/:index/default', protect as any, setDefaultAddress);

// ─── Wishlist Routes ────────────────────────────────────────────────────────
router.get('/wishlist', protect as any, getWishlist);
router.post('/wishlist/:productId', protect as any, addToWishlist);
router.delete('/wishlist/:productId', protect as any, removeFromWishlist);

// ─── Admin: Customer Management (wildcards last) ──────────────────────────────
router.get('/', protect as any, admin as any, getUsers);
router.get('/:id', protect as any, admin as any, getUserById);
router.delete('/:id', protect as any, admin as any, deleteUser);
router.post('/:id/notify', protect as any, admin as any, sendUserNotification);

export default router;
