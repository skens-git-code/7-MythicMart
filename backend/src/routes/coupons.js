import { Router } from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import Coupon from '../models/Coupon.js';
import { asyncHandler, sendError, sendSuccess } from '../utils/apiResponse.js';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422);
  next();
};

const calculateStaticDiscount = (code, subtotal) => {
  if (code !== 'MYTHIC10') return null;
  return {
    code,
    discount: Number(Math.min(subtotal * 0.1, 50).toFixed(2)),
    type: 'percent',
    value: 10,
  };
};

router.post(
  '/validate',
  [
    body('code').trim().notEmpty().withMessage('Coupon code is required').isLength({ max: 32 }),
    body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be a positive number').toFloat(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const code = req.body.code.toUpperCase();
    const subtotal = Number(req.body.subtotal);

    if (mongoose.connection.readyState !== 1) {
      const fallbackCoupon = calculateStaticDiscount(code, subtotal);
      if (!fallbackCoupon) return sendError(res, 'Coupon is invalid or expired', 404);
      return sendSuccess(res, fallbackCoupon);
    }

    const coupon = await Coupon.findOne({ code, active: true });
    if (!coupon) {
      const fallbackCoupon = calculateStaticDiscount(code, subtotal);
      if (!fallbackCoupon) return sendError(res, 'Coupon is invalid or expired', 404);
      return sendSuccess(res, fallbackCoupon);
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return sendError(res, 'Coupon has expired', 410);
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return sendError(res, 'Coupon usage limit reached', 409);
    if (subtotal < coupon.minSubtotal) return sendError(res, `Minimum subtotal is ${coupon.minSubtotal}`, 422);

    sendSuccess(res, {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: coupon.calculateDiscount(subtotal),
    });
  })
);

export default router;
