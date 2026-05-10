import { Router } from 'express';
import mongoose from 'mongoose';
import { body, param, query, validationResult } from 'express-validator';
import User from '../models/User.js';
import Product from '../models/Product.js';
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
    query('role').optional().isIn(['user', 'support', 'manager', 'admin']).withMessage('Invalid role'),
    query('status').optional().isIn(['active', 'disabled']).withMessage('Invalid status'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 25, role, status } = req.query;
    const queryFilter = {};
    if (role) queryFilter.role = role;
    if (status) queryFilter.isActive = status === 'active';

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [users, total] = await Promise.all([
      User.find(queryFilter)
        .select('name email role loyaltyTier isActive emailVerified lastLoginAt createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      User.countDocuments(queryFilter),
    ]);

    sendSuccess(res, users, 200, {
      pagination: { page: pageNumber, limit: limitNumber, total, pages: Math.ceil(total / limitNumber) },
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

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
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
      { new: true }
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
  ],
  validate,
  asyncHandler(async (req, res) => {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (Object.prototype.hasOwnProperty.call(req.body, 'avatar')) updates.avatar = req.body.avatar || null;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    sendSuccess(res, user);
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
      { new: true }
    ).populate('wishlist', 'name slug price image category rating');

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
      { new: true }
    ).populate('wishlist', 'name slug price image category rating');

    sendSuccess(res, user.wishlist);
  })
);

export default router;
