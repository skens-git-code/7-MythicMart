import { Router } from 'express';
import mongoose from 'mongoose';
import { body, param, query, validationResult } from 'express-validator';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { asyncHandler, sendError, sendSuccess } from '../utils/apiResponse.js';
import { optionalAuth, protect, authorize } from '../middleware/auth.js';
import { requireDatabase } from '../middleware/requireDatabase.js';

const router = Router();

const sampleReviews = [
  { id: 'sample-1', rating: 5, title: 'Beautifully built', comment: 'Premium materials and fast delivery.', guestName: 'Verified shopper' },
  { id: 'sample-2', rating: 4, title: 'Great daily carry', comment: 'The product matched the description and packaging felt polished.', guestName: 'Gold member' },
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422);
  next();
};

router.get(
  '/',
  [
    query('productId').optional().trim().isLength({ min: 1, max: 120 }).withMessage('Invalid product identifier'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50').toInt(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) return sendSuccess(res, sampleReviews);

    const { productId, limit = 20 } = req.query;
    const filter = { status: 'approved' };
    if (productId) {
      const isMongo = mongoose.Types.ObjectId.isValid(productId);
      const matchedProduct = await Product.findOne({
        $or: [
          ...(isMongo ? [{ _id: productId }] : []),
          { slug: productId },
          { shopifyProductId: productId },
        ],
      }).select('_id').lean();

      if (matchedProduct) {
        filter.product = matchedProduct._id;
      } else if (isMongo) {
        filter.product = productId;
      }
    }

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    sendSuccess(res, reviews);
  })
);

router.post(
  '/',
  requireDatabase,
  optionalAuth,
  [
    body('productId').trim().notEmpty().withMessage('Product identifier is required').isLength({ max: 120 }),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5').toInt(),
    body('title').optional().trim().isLength({ max: 120 }).withMessage('Title is too long'),
    body('comment').trim().isLength({ min: 10, max: 1000 }).withMessage('Review must be between 10 and 1000 characters'),
    body('guestName').optional().trim().isLength({ max: 80 }).withMessage('Name is too long'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const isMongo = mongoose.Types.ObjectId.isValid(req.body.productId);
    const product = await Product.findOne({
      $or: [
        ...(isMongo ? [{ _id: req.body.productId }] : []),
        { slug: req.body.productId },
        { shopifyProductId: req.body.productId },
      ],
    }).select('_id name rating reviewCount').lean();

    if (!product) return sendError(res, 'Product not found', 404);

    const existingReview = req.user
      ? await Review.findOne({ product: product._id, user: req.user._id }).select('_id').lean()
      : null;
    if (existingReview) return sendError(res, 'You have already reviewed this product', 409);

    const review = await Review.create({
      product: product._id,
      user: req.user?._id || null,
      guestName: req.user?.name || req.body.guestName || 'Anonymous',
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment,
      status: req.user ? 'approved' : 'pending',
    });

    // If review is auto-approved for logged in users, update product average rating
    if (req.user) {
      const allReviews = await Review.find({ product: product._id, status: 'approved' }).select('rating').lean();
      const avgRating = Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1));
      await Product.findByIdAndUpdate(product._id, {
        rating: avgRating,
        reviewCount: allReviews.length,
      });
    }

    sendSuccess(res, review, 201);
  })
);

router.patch(
  '/:id/status',
  requireDatabase,
  protect,
  authorize('admin'),
  [param('id').isMongoId().withMessage('Invalid review id'), body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid review status')],
  validate,
  asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { returnDocument: 'after' });
    if (!review) return sendError(res, 'Review not found', 404);
    sendSuccess(res, review);
  })
);

export default router;
