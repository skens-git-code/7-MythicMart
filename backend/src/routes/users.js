import { Router } from 'express';
import mongoose from 'mongoose';
import { body, param, query, validationResult } from 'express-validator';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { authorize, protect } from '../middleware/auth.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { asyncHandler, sendError, sendSuccess } from '../utils/apiResponse.js';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422);
  next();
};

router.use(requireDatabase, protect);

router.get(
  '/admin',
  authorize('admin', 'manager'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
    query('role').optional().isIn(['all', 'user', 'support', 'manager', 'admin']).withMessage('Invalid role'),
    query('status').optional().isIn(['all', 'active', 'disabled']).withMessage('Invalid status'),
    query('search').optional().trim().isLength({ max: 80 }).withMessage('Search query too long'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 25, role, status, search } = req.query;
    const queryFilter = {};
    if (role && role !== 'all') queryFilter.role = role;
    if (status && status !== 'all') queryFilter.isActive = status === 'active';
    if (search) {
      queryFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { shopifyCustomerId: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [users, total] = await Promise.all([
      User.find(queryFilter)
        .select('name email phone avatar role loyaltyTier totalSpent ordersCount isActive emailVerified lastLoginAt createdAt shopifyCustomerId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      User.countDocuments(queryFilter),
    ]);

    // Enhance users with live spending and order count from Order collection
    const userIds = users.map(u => u._id);
    const orderAggregates = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', totalOrders: { $sum: 1 }, totalSpent: { $sum: '$total' } } }
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

    sendSuccess(res, enrichedUsers, 200, {
      pagination: { page: pageNumber, limit: limitNumber, total, pages: Math.ceil(total / limitNumber) },
    });
  })
);

router.get(
  '/admin/:id',
  authorize('admin', 'manager'),
  [param('id').isMongoId().withMessage('Invalid customer id')],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
      .select('-password')
      .lean();
    if (!user) return sendError(res, 'Customer not found', 404);

    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const lifetimeSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    sendSuccess(res, {
      ...user,
      orders,
      ordersCount: orders.length,
      totalSpent: lifetimeSpent,
    });
  })
);

router.patch(
  '/admin/:id/role',
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid user id'),
    body('role').isIn(['user', 'support', 'manager', 'admin']).withMessage('Invalid role'),
    body('permissions').optional().isArray({ max: 30 }).withMessage('Permissions must be an array'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const updates = { role: req.body.role };
    if (Array.isArray(req.body.permissions)) updates.permissions = req.body.permissions;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after' })
      .select('name email role permissions loyaltyTier isActive emailVerified')
      .lean();
    if (!user) return sendError(res, 'User not found', 404);

    sendSuccess(res, user);
  })
);

router.patch(
  '/admin/:id/status',
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid user id'),
    body('isActive').isBoolean().withMessage('isActive must be boolean').toBoolean(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { returnDocument: 'after' }
    )
      .select('name email role isActive')
      .lean();
    if (!user) return sendError(res, 'User not found', 404);

    sendSuccess(res, user);
  })
);

router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name slug price image category rating').lean();
  sendSuccess(res, user);
}));

router.patch(
  '/profile',
  [
    body('name').optional().trim().isLength({ min: 2, max: 60 }).withMessage('Name must be between 2 and 60 characters'),
    body('avatar').optional({ nullable: true }).trim().isURL().withMessage('Avatar must be a valid URL'),
    body('preferences').optional().isObject().withMessage('Preferences must be an object'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (Object.prototype.hasOwnProperty.call(req.body, 'avatar')) updates.avatar = req.body.avatar || null;
    if (req.body.preferences) {
      const allowed = ['orderUpdates', 'priceDrops', 'security', 'promotions'];
      allowed.forEach((key) => {
        if (typeof req.body.preferences[key] === 'boolean') {
          updates[`preferences.notifications.${key}`] = req.body.preferences[key];
        }
      });
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { returnDocument: 'after', runValidators: true });
    if (!user) return sendError(res, 'User not found', 404);
    sendSuccess(res, user);
  })
);

router.patch(
  '/profile/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
      .withMessage('New password must be at least 8 characters and include uppercase, lowercase, and a number'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return sendError(res, 'User not found', 404);

    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) return sendError(res, 'Current password does not match', 400);

    user.password = req.body.newPassword;
    await user.save();

    sendSuccess(res, { message: 'Password updated successfully' });
  })
);

router.post(
  '/profile/delete-account',
  [
    body('password').notEmpty().withMessage('Password is required for account deletion'),
    body('confirmation').equals('DELETE').withMessage('Must confirm by typing DELETE'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return sendError(res, 'User not found', 404);

    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) return sendError(res, 'Invalid password', 401);

    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    sendSuccess(res, { message: 'Account has been deactivated successfully' });
  })
);

router.post(
  '/wishlist/:productId',
  [param('productId').isMongoId().withMessage('Invalid product id')],
  validate,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.productId).select('_id').lean();
    if (!product) return sendError(res, 'Product not found', 404);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: product._id } },
      { returnDocument: 'after' }
    ).populate('wishlist', 'name slug price image category rating');

    if (!user) return sendError(res, 'User not found', 404);

    sendSuccess(res, user.wishlist);
  })
);

router.delete(
  '/wishlist/:productId',
  [param('productId').isMongoId().withMessage('Invalid product id')],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: new mongoose.Types.ObjectId(req.params.productId) } },
      { returnDocument: 'after' }
    ).populate('wishlist', 'name slug price image category rating');

    if (!user) return sendError(res, 'User not found', 404);

    sendSuccess(res, user.wishlist);
  })
);

export default router;
