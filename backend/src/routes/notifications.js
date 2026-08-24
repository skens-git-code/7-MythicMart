import { Router } from 'express';
import { param, validationResult } from 'express-validator';
import Notification from '../models/Notification.js';
import { asyncHandler, sendError, sendSuccess } from '../utils/apiResponse.js';
import { protect } from '../middleware/auth.js';
import { requireDatabase } from '../middleware/requireDatabase.js';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422);
  next();
};

router.use(requireDatabase, protect);

router.get('/my', asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  sendSuccess(res, notifications);
}));

router.patch('/:id/read', [param('id').isMongoId().withMessage('Invalid notification id')], validate, asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { readAt: new Date() },
    { returnDocument: 'after' }
  );

  if (!notification) return sendError(res, 'Notification not found', 404);
  sendSuccess(res, notification);
}));

router.patch('/read-all', asyncHandler(async (req, res) => {
  const result = await Notification.updateMany({ user: req.user._id, readAt: null }, { $set: { readAt: new Date() } });
  sendSuccess(res, { updated: result.modifiedCount });
}));

router.delete('/:id', [param('id').isMongoId().withMessage('Invalid notification id')], validate, asyncHandler(async (req, res) => {
  const result = await Notification.deleteOne({ _id: req.params.id, user: req.user._id });
  if (!result.deletedCount) return sendError(res, 'Notification not found', 404);
  sendSuccess(res, { deleted: true });
}));

export default router;
