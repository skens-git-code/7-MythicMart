/* Orders routes — create order (guest or auth), get user order history */
import { Router } from 'express';
import mongoose from 'mongoose';
import { body, param, query, validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { asyncHandler, sendSuccess, sendError } from '../utils/apiResponse.js';
import { authorize, protect, optionalAuth } from '../middleware/auth.js';
import { requireDatabase } from '../middleware/requireDatabase.js';

const router = Router();

const TAX_RATE = 0.08; /* 8% */
router.use(requireDatabase);

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422);
  next();
};

import * as shopifyService from '../services/shopifyService.js';

/* POST /api/orders — create order (guest or authenticated) */
router.post(
  '/',
  optionalAuth,
  [
    body('items').isArray({ min: 1, max: 50 }).withMessage('Order must have between 1 and 50 items'),
    body('items.*.productId').trim().notEmpty().withMessage('Invalid product id'),
    body('items.*.quantity').isInt({ min: 1, max: 99 }).withMessage('Item quantity must be between 1 and 99'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422);

    const { items } = req.body;
    
    // In a headless setup, we create a Shopify checkout/cart
    // and return the URL to the frontend to redirect the user.
    try {
      const checkoutUrl = await shopifyService.createCart(items);
      
      // We can still create a pending order in our DB if we want,
      // but for true headless, we just redirect.
      sendSuccess(res, { checkoutUrl }, 201);
    } catch (err) {
      sendError(res, err.message || 'Failed to create Shopify checkout', 500);
    }
  })
);

/* GET /api/orders/my — authenticated user's order history */
router.get('/my', protect, asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  sendSuccess(res, orders);
}));

/* GET /api/orders/admin — role-protected order management list */
router.get(
  '/admin',
  protect,
  authorize('admin', 'manager', 'support'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
    query('status').optional().isIn(['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned']).withMessage('Invalid order status'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 25, status } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const filter = status ? { status } : {};

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .populate('user', 'name email role')
        .lean(),
      Order.countDocuments(filter),
    ]);

    sendSuccess(res, orders, 200, {
      pagination: { page: pageNumber, limit: limitNumber, total, pages: Math.ceil(total / limitNumber) },
    });
  })
);

/* PATCH /api/orders/:id/status — update fulfillment state and tracking */
router.patch(
  '/:id/status',
  protect,
  authorize('admin', 'manager', 'support'),
  [
    param('id').isMongoId().withMessage('Invalid order id'),
    body('status').isIn(['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned']).withMessage('Invalid order status'),
    body('message').optional().trim().isLength({ max: 240 }).withMessage('Message cannot exceed 240 characters'),
    body('tracking.carrier').optional({ nullable: true }).trim().isLength({ max: 80 }).withMessage('Carrier cannot exceed 80 characters'),
    body('tracking.trackingNumber').optional({ nullable: true }).trim().isLength({ max: 120 }).withMessage('Tracking number cannot exceed 120 characters'),
    body('tracking.estimatedDeliveryAt').optional({ nullable: true }).isISO8601().withMessage('Estimated delivery must be a date').toDate(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const updates = {
      $set: {
        status: req.body.status,
      },
      $push: {
        timeline: {
          status: req.body.status,
          message: req.body.message || `Order marked as ${req.body.status}.`,
          at: new Date(),
        },
      },
    };

    if (req.body.tracking) {
      updates.$set.tracking = {
        carrier: req.body.tracking.carrier || null,
        trackingNumber: req.body.tracking.trackingNumber || null,
        estimatedDeliveryAt: req.body.tracking.estimatedDeliveryAt || null,
      };
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after' }).lean();
    if (!order) return sendError(res, 'Order not found', 404);

    sendSuccess(res, order);
  })
);

/* GET /api/orders/:id — get single order (owner or admin) */
router.get('/:id', protect, param('id').isMongoId().withMessage('Invalid order id'), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422);

  const order = await Order.findById(req.params.id).lean();
  if (!order) return sendError(res, 'Order not found', 404);

  const isOwner = order.user?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) return sendError(res, 'Not authorized to view this order', 403);

  sendSuccess(res, order);
}));

export default router;
