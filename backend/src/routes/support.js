import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import SupportTicket from '../models/SupportTicket.js';
import { asyncHandler, sendError, sendSuccess } from '../utils/apiResponse.js';
import { optionalAuth, protect, authorize } from '../middleware/auth.js';
import { requireDatabase } from '../middleware/requireDatabase.js';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422);
  next();
};

router.post(
  '/',
  requireDatabase,
  optionalAuth,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('subject').trim().isLength({ min: 4, max: 160 }).withMessage('Subject must be between 4 and 160 characters'),
    body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters'),
    body('type').optional().isIn(['order', 'payment', 'account', 'product', 'technical', 'other']).withMessage('Invalid ticket type'),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const ticket = await SupportTicket.create({
      user: req.user?._id || null,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
      type: req.body.type || 'other',
      priority: req.body.priority || 'normal',
    });

    sendSuccess(res, ticket, 201);
  })
);

router.get('/my', requireDatabase, protect, asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50).lean();
  sendSuccess(res, tickets);
}));

router.get('/', requireDatabase, protect, authorize('admin'), asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find().sort({ createdAt: -1 }).limit(100).lean();
  sendSuccess(res, tickets);
}));

export default router;
