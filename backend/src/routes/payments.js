// paymentRoutes.js
import { Router } from 'express';
import Stripe from 'stripe';
import crypto from 'crypto';
import { body, validationResult, param } from 'express-validator';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { asyncHandler, sendSuccess, sendError } from '../utils/apiResponse.js';
import { auth } from '../middleware/auth.js';        // require authenticated user
import { requireDatabase } from '../middleware/requireDatabase.js';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';              // your logging utility

const router = Router();
router.use(requireDatabase);

// Stripe instance – uses secret key from env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia', // use latest stable
});

// ---------- Helper: validation middleware ----------
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

// ---------- GET /api/payments/config ----------
router.get('/config', (req, res) => {
  sendSuccess(res, {
    mode: config.isProduction ? 'production' : 'sandbox',
    supportedMethods: ['card', 'stripe', 'apple_pay', 'google_pay'],
    currency: 'USD',
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_...',
  });
});

// ---------- POST /api/payments/create-intent ----------
router.post(
  '/create-intent',
  auth, // require authentication
  [
    body('amount').isFloat({ min: 0.5, max: 999999.99 }).withMessage('Invalid amount'),
    body('currency')
      .optional()
      .isString()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be a 3-letter code'),
    body('orderId')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Order ID required')
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Invalid order ID format'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { amount, currency = 'USD', orderId } = req.body;
    const userId = req.user.id; // from auth middleware

    // 1. Fetch order and verify ownership
    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }
    if (order.userId.toString() !== userId) {
      return sendError(res, 'You do not own this order', 403);
    }
    // 2. Check order status – only pending orders can be paid
    if (order.status !== 'pending') {
      return sendError(res, `Order is already ${order.status} and cannot be paid`, 400);
    }
    // 3. Verify amount matches order total (optional but recommended)
    if (Math.abs(order.totalAmount - amount) > 0.01) {
      return sendError(res, 'Amount does not match order total', 400);
    }

    // 4. Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: currency.toLowerCase(),
      metadata: {
        orderId: order._id.toString(),
        userId: userId,
      },
      // Optionally attach a customer if you have one
    });

    // 5. Store payment intent ID in the order (but not yet paid)
    order.paymentInfo = {
      provider: 'stripe',
      transactionId: paymentIntent.id,
      status: 'pending',
      paidAt: null,
      stripeClientSecret: paymentIntent.client_secret,
    };
    await order.save();

    // 6. Return client secret to frontend
    sendSuccess(
      res,
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        currency,
        status: paymentIntent.status,
      },
      201
    );
  })
);

// ---------- POST /api/payments/confirm ----------
// This endpoint can be used by the frontend after client-side confirmation.
// It verifies with Stripe and updates the order atomically.
router.post(
  '/confirm',
  auth,
  [
    body('paymentIntentId')
      .trim()
      .notEmpty()
      .withMessage('Payment intent ID required'),
    body('orderId')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Order ID required')
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Invalid order ID'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { paymentIntentId, orderId } = req.body;
    const userId = req.user.id;

    // 1. Fetch order and verify ownership
    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }
    if (order.userId.toString() !== userId) {
      return sendError(res, 'Unauthorized', 403);
    }

    // 2. Check if already paid to avoid double processing
    if (order.paymentStatus === 'paid') {
      return sendSuccess(res, {
        success: true,
        message: 'Order already paid',
        orderId: order._id,
        paymentStatus: order.paymentStatus,
      });
    }

    // 3. Retrieve PaymentIntent from Stripe to verify status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return sendError(
        res,
        `Payment not successful (status: ${paymentIntent.status})`,
        400
      );
    }

    // 4. Atomic update: only if paymentStatus is not 'paid'
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        paymentStatus: { $ne: 'paid' }, // prevent race
      },
      {
        $set: {
          paymentStatus: 'paid',
          'paymentInfo.status': 'succeeded',
          'paymentInfo.paidAt': new Date(),
          status: 'processing',
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      // This means another request already updated it
      return sendSuccess(res, {
        success: true,
        message: 'Order already paid (concurrent update)',
        orderId: orderId,
      });
    }

    // 5. (Optional) trigger post-payment actions (inventory, emails, etc.)
    // You can emit an event or call a service here.

    sendSuccess(res, {
      success: true,
      message: 'Payment confirmed successfully',
      orderId: updatedOrder._id,
      orderNumber: updatedOrder.orderNumber,
      paymentStatus: updatedOrder.paymentStatus,
    });
  })
);

// ---------- POST /api/payments/webhook ----------
// Stripe webhook endpoint – must be protected by signature verification
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }), // need raw body for verification
  asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.error('Stripe webhook secret not configured');
      return res.status(500).send('Webhook secret missing');
    }

    let event;
    try {
      // Verify signature using Stripe's library
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      logger.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Process the event asynchronously – acknowledge receipt immediately
    res.status(200).json({ received: true });

    // Handle event in background (or use a queue for reliability)
    // Use setImmediate to not block response
    setImmediate(async () => {
      try {
        await handleStripeEvent(event);
      } catch (error) {
        logger.error(`Webhook processing error: ${error.message}`, { event });
        // Optionally store failed events for manual retry
      }
    });
  })
);

// ---------- Webhook event handler ----------
async function handleStripeEvent(event) {
  // Idempotency: store processed event IDs in a separate collection (e.g., StripeEvents)
  // We'll implement a simple check using the event id.
  const EventModel = mongoose.model('StripeEvent', new mongoose.Schema({
    eventId: { type: String, unique: true },
    processedAt: { type: Date, default: Date.now },
  }));

  const existing = await EventModel.findOne({ eventId: event.id });
  if (existing) {
    logger.info(`Duplicate webhook event ${event.id} – skipping`);
    return;
  }

  // Save event ID to mark as processed (atomic)
  await EventModel.create({ eventId: event.id });

  // Handle relevant event types
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;
      if (!orderId) {
        logger.warn('PaymentIntent succeeded but no orderId in metadata');
        return;
      }

      // Atomic update: only if paymentStatus is not 'paid' and order is pending
      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: orderId,
          paymentStatus: { $ne: 'paid' },
          status: 'pending',
        },
        {
          $set: {
            paymentStatus: 'paid',
            'paymentInfo.status': 'succeeded',
            'paymentInfo.paidAt': new Date(),
            'paymentInfo.transactionId': paymentIntent.id,
            status: 'processing',
          },
        },
        { new: true }
      );

      if (updatedOrder) {
        logger.info(`Order ${orderId} marked as paid via webhook`);
        // Trigger post-payment actions (inventory, email, etc.)
      } else {
        logger.warn(`Order ${orderId} could not be updated – already paid or wrong status`);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          'paymentInfo.status': 'failed',
        });
        logger.info(`Payment failed for order ${orderId}`);
      }
      break;
    }

    // Handle other events: charge.refunded, dispute, etc.
    default:
      logger.info(`Unhandled webhook event type: ${event.type}`);
  }
}

export default router;