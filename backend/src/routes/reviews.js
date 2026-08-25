// reviewsRoutes.js - Complete production-ready review system with moderation, verification, and performance optimizations

import { Router } from 'express';
import mongoose from 'mongoose';
import { body, param, query, validationResult } from 'express-validator';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js'; // needed for purchase verification
import { asyncHandler, sendError, sendSuccess } from '../utils/apiResponse.js';
import { optionalAuth, protect, authorize } from '../middleware/auth.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import logger from '../utils/logger.js';
import cache from '../utils/cache.js';
import sanitizeHtml from 'sanitize-html'; // npm install sanitize-html
import { updateProductRating } from '../services/productRatingService.js'; // background job

const router = Router();
const CACHE_TTL = 600; // 10 minutes

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

// ---------- Helper: find product by identifier ----------
async function findProduct(identifier) {
  const isMongo = mongoose.Types.ObjectId.isValid(identifier);
  const query = {
    $or: [
      ...(isMongo ? [{ _id: identifier }] : []),
      { slug: identifier },
      { shopifyProductId: identifier },
    ],
    isActive: true,
  };
  return await Product.findOne(query).select('_id name rating reviewCount').lean();
}

// ---------- Helper: sanitize review comment ----------
function sanitizeComment(text) {
  return sanitizeHtml(text, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    allowedAttributes: {
      'a': ['href', 'target'],
    },
    allowedSchemes: ['http', 'https'],
  });
}

// ---------- GET /api/reviews – list reviews with filters and pagination ----------
router.get(
  '/',
  [
    query('productId').optional().trim().isLength({ min: 1, max: 120 }).withMessage('Invalid product identifier'),
    query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit between 1 and 50').toInt(),
    query('sort').optional().isIn(['newest', 'oldest', 'rating-high', 'rating-low']).withMessage('Invalid sort'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { productId, status, page = 1, limit = 20, sort = 'newest' } = req.query;
    const filter = {};

    // If productId provided, resolve product
    if (productId) {
      const product = await findProduct(productId);
      if (!product) {
        return sendError(res, 'Product not found', 404);
      }
      filter.product = product._id;
    }

    // Status filter – only admin can see non-approved? We'll let public see only approved by default.
    // For public, we only show 'approved'. If admin, they can see all via separate admin endpoint.
    // For simplicity, we only return approved reviews publicly.
    filter.status = 'approved';

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const sortMap = {
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 },
      'rating-high': { rating: -1, createdAt: -1 },
      'rating-low': { rating: 1, createdAt: -1 },
    };
    const sortObj = sortMap[sort] || sortMap['newest'];

    // Try cache
    const cacheKey = `reviews:${JSON.stringify(req.query)}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return sendSuccess(res, cached.reviews, 200, { pagination: cached.pagination, cached: true });
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort(sortObj)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .populate('user', 'name') // only show user name, not email
        .lean(),
      Review.countDocuments(filter),
    ]);

    const pagination = {
      page: pageNumber,
      limit: limitNumber,
      total,
      pages: Math.ceil(total / limitNumber),
    };

    // Cache
    await cache.set(cacheKey, { reviews, pagination }, CACHE_TTL);

    res.set('Cache-Control', `public, max-age=${CACHE_TTL}`);
    sendSuccess(res, reviews, 200, { pagination });
  })
);

// ---------- GET /api/reviews/admin – admin view with all statuses ----------
router.get(
  '/admin',
  protect,
  authorize('admin', 'manager', 'support'),
  [
    query('productId').optional().trim().isLength({ min: 1, max: 120 }),
    query('status').optional().isIn(['pending', 'approved', 'rejected']),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('sort').optional().isIn(['newest', 'oldest', 'rating-high', 'rating-low']),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { productId, status, page = 1, limit = 20, sort = 'newest' } = req.query;
    const filter = {};
    if (productId) {
      const product = await findProduct(productId);
      if (!product) return sendError(res, 'Product not found', 404);
      filter.product = product._id;
    }
    if (status) filter.status = status;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const sortMap = {
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 },
      'rating-high': { rating: -1, createdAt: -1 },
      'rating-low': { rating: 1, createdAt: -1 },
    };
    const sortObj = sortMap[sort] || sortMap['newest'];

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort(sortObj)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .populate('user', 'name email role')
        .populate('product', 'title handle')
        .lean(),
      Review.countDocuments(filter),
    ]);

    sendSuccess(res, reviews, 200, {
      pagination: { page: pageNumber, limit: limitNumber, total, pages: Math.ceil(total / limitNumber) },
    });
  })
);

// ---------- POST /api/reviews – create a review ----------
router.post(
  '/',
  requireDatabase,
  optionalAuth,
  [
    body('productId').trim().notEmpty().withMessage('Product identifier is required').isLength({ max: 120 }),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5').toInt(),
    body('title').optional().trim().isLength({ max: 120 }).withMessage('Title too long'),
    body('comment').trim().isLength({ min: 10, max: 1000 }).withMessage('Review must be between 10 and 1000 characters'),
    body('guestName').optional().trim().isLength({ max: 80 }).withMessage('Name too long'),
    body('guestEmail').optional().isEmail().withMessage('Invalid email'),
    body('idempotencyKey').optional().isString().trim().isLength({ max: 100 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { productId, rating, title, comment, guestName, guestEmail, idempotencyKey } = req.body;
    const userId = req.user?._id || null;

    // 1. Idempotency
    if (idempotencyKey) {
      const existing = await Review.findOne({ idempotencyKey }).lean();
      if (existing) {
        return sendSuccess(res, existing, 200);
      }
    }

    // 2. Find product (must be active)
    const product = await findProduct(productId);
    if (!product) {
      return sendError(res, 'Product not found or inactive', 404);
    }

    // 3. Check if user already reviewed (only for logged-in)
    if (userId) {
      const existing = await Review.findOne({ product: product._id, user: userId }).lean();
      if (existing) {
        return sendError(res, 'You have already reviewed this product', 409);
      }
    } else {
      // For guest, we could check by email if provided
      if (guestEmail) {
        const existing = await Review.findOne({ product: product._id, guestEmail }).lean();
        if (existing) {
          return sendError(res, 'This email already reviewed this product', 409);
        }
      }
    }

    // 4. Optional: verify purchase (recommended)
    let verifiedPurchase = false;
    if (userId) {
      // Check if user has a completed order containing this product
      const order = await Order.findOne({
        user: userId,
        status: { $in: ['delivered', 'shipped'] },
        'items.productId': product._id,
      }).lean();
      verifiedPurchase = !!order;
    } else if (guestEmail) {
      // For guests, we could check by email if orders store guestEmail
      const order = await Order.findOne({
        guestEmail,
        status: { $in: ['delivered', 'shipped'] },
        'items.productId': product._id,
      }).lean();
      verifiedPurchase = !!order;
    }

    // 5. Auto-approve if logged-in and has verified purchase? Or always pending for moderation?
    // We'll auto-approve if user is logged in (trusted) or if verified purchase.
    const autoApprove = !!(userId || verifiedPurchase);
    const status = autoApprove ? 'approved' : 'pending';

    // 6. Sanitize comment
    const sanitizedComment = sanitizeComment(comment);

    // 7. Create review
    const reviewData = {
      product: product._id,
      user: userId,
      guestName: userId ? null : (guestName || 'Anonymous'),
      guestEmail: userId ? null : guestEmail,
      rating,
      title: title || null,
      comment: sanitizedComment,
      status,
      verifiedPurchase,
      idempotencyKey: idempotencyKey || null,
    };

    const review = await Review.create(reviewData);

    // 8. If approved, update product rating asynchronously (background job)
    if (status === 'approved') {
      // Trigger background job to recalc product rating
      await updateProductRating(product._id);
      // Also invalidate product list cache
      await cache.delPattern('products:*');
    }

    // 9. Invalidate review cache for this product
    await cache.delPattern(`reviews:*productId=${productId}*`);

    sendSuccess(res, review, 201);
  })
);

// ---------- PATCH /api/reviews/:id – user can edit their own review (if not approved yet?) ----------
router.patch(
  '/:id',
  protect,
  [
    param('id').isMongoId().withMessage('Invalid review ID'),
    body('rating').optional().isInt({ min: 1, max: 5 }).toInt(),
    body('title').optional().trim().isLength({ max: 120 }),
    body('comment').optional().trim().isLength({ min: 10, max: 1000 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) return sendError(res, 'Review not found', 404);

    // Only owner or admin can edit
    const isOwner = review.user?.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'manager'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return sendError(res, 'Not authorized to edit this review', 403);
    }

    // If already approved, you can't edit (except admin)
    if (review.status === 'approved' && !isAdmin) {
      return sendError(res, 'Approved reviews cannot be edited', 400);
    }

    const update = {};
    if (req.body.rating) update.rating = req.body.rating;
    if (req.body.title) update.title = req.body.title;
    if (req.body.comment) update.comment = sanitizeComment(req.body.comment);

    const updated = await Review.findByIdAndUpdate(req.params.id, update, { new: true });
    sendSuccess(res, updated);
  })
);

// ---------- DELETE /api/reviews/:id – delete review (owner or admin) ----------
router.delete(
  '/:id',
  protect,
  [
    param('id').isMongoId().withMessage('Invalid review ID'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) return sendError(res, 'Review not found', 404);

    const isOwner = review.user?.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'manager'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return sendError(res, 'Not authorized to delete this review', 403);
    }

    await review.deleteOne();
    // If review was approved, recalc product rating
    if (review.status === 'approved') {
      await updateProductRating(review.product);
    }
    // Invalidate caches
    await cache.delPattern(`reviews:*productId=${review.product}*`);
    await cache.delPattern('products:*');

    sendSuccess(res, { message: 'Review deleted successfully' });
  })
);

// ---------- PATCH /api/reviews/:id/status – admin moderate ----------
router.patch(
  '/:id/status',
  requireDatabase,
  protect,
  authorize('admin', 'manager'),
  [
    param('id').isMongoId().withMessage('Invalid review id'),
    body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) return sendError(res, 'Review not found', 404);

    const oldStatus = review.status;
    review.status = req.body.status;
    await review.save();

    // If status changed to approved, update product rating
    if (req.body.status === 'approved' && oldStatus !== 'approved') {
      await updateProductRating(review.product);
      await cache.delPattern('products:*');
    } else if (req.body.status !== 'approved' && oldStatus === 'approved') {
      // If removed from approved, recalc (remove this review's rating)
      await updateProductRating(review.product);
      await cache.delPattern('products:*');
    }

    // Invalidate review caches
    await cache.delPattern(`reviews:*productId=${review.product}*`);

    sendSuccess(res, review);
  })
);

// ---------- POST /api/reviews/:id/helpful – mark helpful (like) ----------
router.post(
  '/:id/helpful',
  optionalAuth,
  [
    param('id').isMongoId().withMessage('Invalid review ID'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) return sendError(res, 'Review not found', 404);

    // Increment helpful count (could add per-user tracking to prevent abuse)
    review.helpfulCount = (review.helpfulCount || 0) + 1;
    await review.save();

    sendSuccess(res, { helpfulCount: review.helpfulCount });
  })
);

export default router;