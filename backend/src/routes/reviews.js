import { Router } from 'express';
import mongoose from 'mongoose';
import { body, query, validationResult } from 'express-validator';
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
    query('productId').optional().trim().isLength({ max: 80 }).withMessage('Invalid product id'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50').toInt(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) return sendSuccess(res, sampleReviews);

    const { productId, limit = 20 } = req.query;
    const filter = { status: 'approved' };
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      filter.product = productId;
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
    body('productId').isMongoId().withMessage('Valid product id is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5').toInt(),
    body('title').optional().trim().isLength({ max: 120 }).withMessage('Title is too long'),
    body('comment').trim().isLength({ min: 10, max: 1000 }).withMessage('Review must be between 10 and 1000 characters'),
    body('guestName').optional().trim().isLength({ max: 80 }).withMessage('Name is too long'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const review = await Review.create({
      product: req.body.productId,
      user: req.user?._id || null,
      guestName: req.user?.name || req.body.guestName,
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment,
      status: req.user ? 'approved' : 'pending',
    });

    sendSuccess(res, review, 201);
  })
);

router.patch(
  '/:id/status',
  requireDatabase,
  protect,
  authorize('admin'),
  [body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid review status')],
  validate,
  asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { returnDocument: 'after' });
    if (!review) return sendError(res, 'Review not found', 404);
    sendSuccess(res, review);
  })
);

export default router;
