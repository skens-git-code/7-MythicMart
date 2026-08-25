// usersRoutes.js - Complete production-ready user management system
// Features: User CRUD (admin), profile management, wishlist, addresses, password change,
// account deactivation, audit logging, email uniqueness, pagination, validation, rate limiting.

import { Router } from 'express';
import mongoose from 'mongoose';
import { body, param, query, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import AuditLog from '../models/AuditLog.js';
import { authorize, protect } from '../middleware/auth.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { asyncHandler, sendError, sendSuccess } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';
import cache from '../utils/cache.js';
import { rateLimit } from 'express-rate-limit'; // npm install express-rate-limit

const router = Router();

// ---------- Rate limiting ----------
const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5, // 5 attempts per IP
  message: { success: false, error: 'Too many password change attempts, please try again later.' },
});

const accountDeletionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { success: false, error: 'Too many account deletion attempts, please try again later.' },
});

// ---------- Helper: validation (return all errors) ----------
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(
      res,
      errors.array().map(e => e.msg).join('. '),
      422
    );
  }
  next();
};

// ---------- Helper: check email uniqueness (except self) ----------
const isEmailUnique = async (email, excludeUserId = null) => {
  const query = { email: email.toLowerCase() };
  if (excludeUserId) query._id = { $ne: excludeUserId };
  const user = await User.findOne(query).lean();
  return !user;
};

// ---------- Helper: sanitize user object (remove password) ----------
const sanitizeUser = (user) => {
  if (user) {
    const { password, ...rest } = user.toObject ? user.toObject() : user;
    return rest;
  }
  return null;
};

// ---------- Middleware: all routes require database and auth ----------
router.use(requireDatabase, protect);

// ============ ADMIN ROUTES ============

// GET /api/users/admin - Admin user list with filters
router.get(
  '/admin',
  authorize('admin', 'manager'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit between 1 and 100').toInt(),
    query('role').optional().isIn(['all', 'user', 'support', 'manager', 'admin']).withMessage('Invalid role'),
    query('status').optional().isIn(['all', 'active', 'disabled']).withMessage('Invalid status'),
    query('search').optional().trim().isLength({ max: 80 }).withMessage('Search too long'),
    query('sort').optional().isIn(['newest', 'oldest', 'spent-high', 'spent-low']).withMessage('Invalid sort'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 25, role, status, search, sort = 'newest' } = req.query;
    const filter = {};

    if (role && role !== 'all') filter.role = role;
    if (status && status !== 'all') filter.isActive = status === 'active';
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { phone: { $regex: escaped, $options: 'i' } },
        { shopifyCustomerId: { $regex: escaped, $options: 'i' } },
      ];
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const sortMap = {
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 },
      'spent-high': { totalSpent: -1 },
      'spent-low': { totalSpent: 1 },
    };
    const sortObj = sortMap[sort] || sortMap['newest'];

    const cacheKey = `users:admin:${JSON.stringify(req.query)}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return sendSuccess(res, cached.users, 200, { pagination: cached.pagination, cached: true });
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email phone avatar role loyaltyTier totalSpent ordersCount isActive emailVerified lastLoginAt createdAt shopifyCustomerId')
        .sort(sortObj)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Optionally enhance with live order stats (if not already up-to-date)
    const userIds = users.map(u => u._id);
    const orderAggregates = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', totalOrders: { $sum: 1 }, totalSpent: { $sum: '$total' } } },
    ]);
    const ordersMap = new Map();
    orderAggregates.forEach(agg => ordersMap.set(agg._id.toString(), agg));

    const enrichedUsers = users.map(u => {
      const stats = ordersMap.get(u._id.toString());
      return {
        ...u,
        ordersCount: stats ? stats.totalOrders : (u.ordersCount || 0),
        totalSpent: stats ? stats.totalSpent : (u.totalSpent || 0),
      };
    });

    const pagination = { page: pageNumber, limit: limitNumber, total, pages: Math.ceil(total / limitNumber) };
    await cache.set(cacheKey, { users: enrichedUsers, pagination }, 300); // 5 min

    sendSuccess(res, enrichedUsers, 200, { pagination });
  })
);

// GET /api/users/admin/:id - Get user details with orders
router.get(
  '/admin/:id',
  authorize('admin', 'manager'),
  [
    param('id').isMongoId().withMessage('Invalid customer ID'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
      .select('-password')
      .lean();
    if (!user) return sendError(res, 'User not found', 404);

    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(100) // admin view limit
      .lean();

    const lifetimeSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Also get addresses
    const addresses = user.addresses || [];

    sendSuccess(res, {
      ...user,
      orders,
      ordersCount: orders.length,
      totalSpent: lifetimeSpent,
      addresses,
    });
  })
);

// PATCH /api/users/admin/:id/role - Update role and permissions
router.patch(
  '/admin/:id/role',
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('role').isIn(['user', 'support', 'manager', 'admin']).withMessage('Invalid role'),
    body('permissions').optional().isArray({ max: 30 }).withMessage('Permissions must be an array'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role, permissions } = req.body;

    const updates = { role };
    if (permissions) updates.permissions = permissions;

    // Prevent self-demotion (admin cannot remove their own admin role)
    if (id === req.user._id.toString() && role !== 'admin') {
      return sendError(res, 'You cannot remove your own admin role', 400);
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true })
      .select('name email role permissions loyaltyTier isActive emailVerified')
      .lean();

    if (!user) return sendError(res, 'User not found', 404);

    // Audit log
    await AuditLog.create({
      userId: req.user._id,
      action: 'update_user_role',
      targetId: id,
      targetType: 'User',
      changes: { role, permissions },
    });

    // Invalidate cache
    await cache.delPattern('users:admin:*');

    sendSuccess(res, user);
  })
);

// PATCH /api/users/admin/:id/status - Enable/disable user
router.patch(
  '/admin/:id/status',
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('isActive').isBoolean().withMessage('isActive must be boolean').toBoolean(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (id === req.user._id.toString()) {
      return sendError(res, 'You cannot disable your own account', 400);
    }

    const user = await User.findByIdAndUpdate(id, { isActive }, { new: true })
      .select('name email role isActive')
      .lean();

    if (!user) return sendError(res, 'User not found', 404);

    await AuditLog.create({
      userId: req.user._id,
      action: 'update_user_status',
      targetId: id,
      targetType: 'User',
      changes: { isActive },
    });

    await cache.delPattern('users:admin:*');

    sendSuccess(res, user);
  })
);

// DELETE /api/users/admin/:id - Delete user (hard delete – use with caution)
router.delete(
  '/admin/:id',
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return sendError(res, 'You cannot delete your own account', 400);
    }

    const user = await User.findById(id);
    if (!user) return sendError(res, 'User not found', 404);

    // Instead of hard delete, we soft-delete by setting isActive=false and adding deletedAt
    user.isActive = false;
    user.deletedAt = new Date();
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'delete_user',
      targetId: id,
      targetType: 'User',
      changes: { deleted: true },
    });

    await cache.delPattern('users:admin:*');

    sendSuccess(res, { message: 'User has been deactivated and marked as deleted' });
  })
);

// ============ USER PROFILE ROUTES ============

// GET /api/users/profile - Get own profile
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'name slug price image category rating')
    .lean();
  sendSuccess(res, sanitizeUser(user));
}));

// PATCH /api/users/profile - Update profile
router.patch(
  '/profile',
  [
    body('name').optional().trim().isLength({ min: 2, max: 60 }).withMessage('Name must be between 2 and 60 characters'),
    body('email').optional().isEmail().withMessage('Invalid email').normalizeEmail(),
    body('phone').optional().trim().isLength({ min: 7, max: 20 }).withMessage('Invalid phone number'),
    body('avatar').optional({ nullable: true }).isURL().withMessage('Avatar must be a valid URL'),
    body('preferences').optional().isObject().withMessage('Preferences must be an object'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const updates = {};

    if (req.body.name) updates.name = req.body.name;
    if (req.body.phone) updates.phone = req.body.phone;
    if (req.body.avatar !== undefined) updates.avatar = req.body.avatar || null;

    // Handle email change with uniqueness check
    if (req.body.email) {
      const email = req.body.email.toLowerCase();
      if (email !== req.user.email) {
        const exists = await User.findOne({ email, _id: { $ne: userId } }).lean();
        if (exists) {
          return sendError(res, 'Email already in use', 409);
        }
        updates.email = email;
        updates.emailVerified = false; // require re-verification
      }
    }

    // Preferences
    if (req.body.preferences) {
      const allowed = ['orderUpdates', 'priceDrops', 'security', 'promotions'];
      const prefUpdates = {};
      allowed.forEach((key) => {
        if (typeof req.body.preferences[key] === 'boolean') {
          prefUpdates[`preferences.notifications.${key}`] = req.body.preferences[key];
        }
      });
      if (Object.keys(prefUpdates).length > 0) {
        updates['$set'] = prefUpdates;
      }
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, 'No valid fields to update', 400);
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true })
      .populate('wishlist', 'name slug price image category rating')
      .lean();

    // Invalidate caches
    await cache.delPattern(`users:admin:*`);

    sendSuccess(res, sanitizeUser(user));
  })
);

// PATCH /api/users/profile/password - Change password
router.patch(
  '/profile/password',
  passwordChangeLimiter,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
      .withMessage('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return sendError(res, 'User not found', 404);

    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) return sendError(res, 'Current password is incorrect', 400);

    user.password = req.body.newPassword;
    await user.save();

    // Optionally: invalidate all refresh tokens / sessions (if using JWT with version)
    // Could increment token version here.

    // Audit log
    await AuditLog.create({
      userId: req.user._id,
      action: 'change_password',
      targetId: req.user._id,
      targetType: 'User',
      changes: { passwordChanged: true },
    });

    sendSuccess(res, { message: 'Password updated successfully' });
  })
);

// POST /api/users/profile/deactivate - Deactivate account (soft delete)
router.post(
  '/profile/deactivate',
  accountDeletionLimiter,
  [
    body('password').notEmpty().withMessage('Password is required'),
    body('confirmation').equals('DELETE').withMessage('Must confirm by typing DELETE'),
    body('reason').optional().trim().isLength({ max: 200 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return sendError(res, 'User not found', 404);

    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) return sendError(res, 'Invalid password', 401);

    user.isActive = false;
    user.deactivatedAt = new Date();
    user.deactivationReason = req.body.reason || null;
    await user.save({ validateBeforeSave: false });

    await AuditLog.create({
      userId: req.user._id,
      action: 'deactivate_account',
      targetId: req.user._id,
      targetType: 'User',
      changes: { reason: req.body.reason || null },
    });

    // Clear any user-specific caches
    await cache.delPattern(`users:admin:*`);

    sendSuccess(res, { message: 'Account has been deactivated successfully' });
  })
);

// ============ ADDRESS MANAGEMENT ============

// GET /api/users/addresses - Get all addresses
router.get('/addresses', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('addresses').lean();
  sendSuccess(res, user.addresses || []);
}));

// POST /api/users/addresses - Add new address
router.post(
  '/addresses',
  [
    body('address').isObject().withMessage('Address must be an object'),
    body('address.street').notEmpty().withMessage('Street is required'),
    body('address.city').notEmpty().withMessage('City is required'),
    body('address.state').notEmpty().withMessage('State is required'),
    body('address.zip').notEmpty().withMessage('Zip code is required'),
    body('address.country').notEmpty().withMessage('Country is required'),
    body('address.isDefault').optional().isBoolean(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 'User not found', 404);

    const addresses = user.addresses || [];
    const newAddress = {
      ...req.body.address,
      isDefault: req.body.address.isDefault || false,
    };

    // If this is set as default, unset others
    if (newAddress.isDefault) {
      addresses.forEach(addr => addr.isDefault = false);
    }

    addresses.push(newAddress);
    user.addresses = addresses;
    await user.save();

    sendSuccess(res, user.addresses, 201);
  })
);

// PATCH /api/users/addresses/:addressId - Update an address
router.patch(
  '/addresses/:addressId',
  [
    param('addressId').isMongoId().withMessage('Invalid address ID'),
    body('address').isObject().withMessage('Address must be an object'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 'User not found', 404);

    const addresses = user.addresses || [];
    const index = addresses.findIndex(addr => addr._id.toString() === req.params.addressId);
    if (index === -1) return sendError(res, 'Address not found', 404);

    // Update fields
    const { street, city, state, zip, country, isDefault } = req.body.address;
    if (street) addresses[index].street = street;
    if (city) addresses[index].city = city;
    if (state) addresses[index].state = state;
    if (zip) addresses[index].zip = zip;
    if (country) addresses[index].country = country;

    if (isDefault !== undefined) {
      if (isDefault) {
        addresses.forEach(addr => addr.isDefault = false);
        addresses[index].isDefault = true;
      } else {
        addresses[index].isDefault = false;
      }
    }

    user.addresses = addresses;
    await user.save();

    sendSuccess(res, user.addresses);
  })
);

// DELETE /api/users/addresses/:addressId - Delete an address
router.delete(
  '/addresses/:addressId',
  [
    param('addressId').isMongoId().withMessage('Invalid address ID'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 'User not found', 404);

    const addresses = user.addresses || [];
    const filtered = addresses.filter(addr => addr._id.toString() !== req.params.addressId);
    if (filtered.length === addresses.length) {
      return sendError(res, 'Address not found', 404);
    }
    // If the deleted address was default, set first as default
    let wasDefault = addresses.find(addr => addr._id.toString() === req.params.addressId)?.isDefault;
    user.addresses = filtered;
    if (wasDefault && filtered.length > 0) {
      filtered[0].isDefault = true;
    }
    await user.save();

    sendSuccess(res, user.addresses);
  })
);

// ============ WISHLIST ============

// POST /api/users/wishlist/:productId - Add to wishlist
router.post(
  '/wishlist/:productId',
  [
    param('productId').isMongoId().withMessage('Invalid product ID'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.productId).select('_id').lean();
    if (!product) return sendError(res, 'Product not found', 404);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: product._id } },
      { new: true }
    ).populate('wishlist', 'name slug price image category rating');

    if (!user) return sendError(res, 'User not found', 404);

    sendSuccess(res, user.wishlist);
  })
);

// DELETE /api/users/wishlist/:productId - Remove from wishlist
router.delete(
  '/wishlist/:productId',
  [
    param('productId').isMongoId().withMessage('Invalid product ID'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: new mongoose.Types.ObjectId(req.params.productId) } },
      { new: true }
    ).populate('wishlist', 'name slug price image category rating');

    if (!user) return sendError(res, 'User not found', 404);

    sendSuccess(res, user.wishlist);
  })
);

// GET /api/users/wishlist - Get wishlist
router.get('/wishlist', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'name slug price image category rating')
    .lean();
  sendSuccess(res, user.wishlist);
}));

export default router;