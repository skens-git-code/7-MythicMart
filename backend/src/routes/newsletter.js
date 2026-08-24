import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Subscriber from '../models/Subscriber.js';
import { asyncHandler, sendError, sendSuccess } from '../utils/apiResponse.js';
import { requireDatabase } from '../middleware/requireDatabase.js';

const router = Router();

router.post(
  '/subscribe',
  requireDatabase,
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422);

    const subscriber = await Subscriber.findOneAndUpdate(
      { email: req.body.email },
      { $set: { active: true, unsubscribedAt: null }, $setOnInsert: { email: req.body.email, subscribedAt: new Date() } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).lean();

    sendSuccess(res, { subscribed: true, email: subscriber.email });
  })
);

export default router;
