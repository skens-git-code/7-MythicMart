/* Auth routes — register, login, get current user */
import crypto from 'crypto';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import { asyncHandler, sendSuccess, sendError } from '../utils/apiResponse.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { config } from '../config/env.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

const router = Router();

const signToken = (id) =>
  jwt.sign({ id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

/* Validation rules */
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 60 }).withMessage('Name cannot exceed 60 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
    .withMessage('Password must be at least 8 characters and include uppercase, lowercase, and a number'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array().map(e => e.msg).join('. '), 422);
  }
  next();
};

router.use(requireDatabase);

/* POST /api/auth/register */
router.post('/register', authLimiter, registerRules, validate, asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return sendError(res, 'An account with this email already exists', 409);

  const user = await User.create({ name, email, password });
  await Customer.updateOne({ email }, { $set: { user: user._id, name, lastActivityAt: new Date() }, $setOnInsert: { source: 'local', email, status: 'active' } }, { upsert: true, runValidators: true });
  const token = signToken(user._id);

  sendSuccess(res, {
    token,
    expiresIn: config.jwt.expiresIn,
    user: user.toAuthJSON(),
  }, 201);
}));

/* POST /api/auth/login */
router.post('/login', authLimiter, loginRules, validate, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return sendError(res, 'Invalid email or password', 401);
  }

  if (!user.isActive) {
    return sendError(res, 'This account is disabled', 403);
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);
  sendSuccess(res, {
    token,
    expiresIn: config.jwt.expiresIn,
    user: user.toAuthJSON(),
  });
}));

/* POST /api/auth/forgot-password */
router.post('/forgot-password', authLimiter, [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
], validate, asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // For security, do not disclose whether user exists
  if (!user) {
    return sendSuccess(res, {
      message: 'If an account exists with that email, password reset instructions and an OTP have been sent.',
    });
  }

  const { resetToken, otp } = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  await sendPasswordResetEmail(user, resetToken, otp);

  sendSuccess(res, {
    message: 'If an account exists with that email, password reset instructions and an OTP have been sent.',
    // Return masked email confirmation
    email: email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(Math.max(1, b.length))),
    // In test environment, expose OTP/token to allow deterministic testing
    ...(config.isTest ? { testOtp: otp, testToken: resetToken } : {}),
  });
}));

/* POST /api/auth/verify-otp */
router.post('/verify-otp', authLimiter, [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp').trim().notEmpty().withMessage('OTP is required'),
], validate, asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const hashedOtp = crypto.createHash('sha256').update(otp.trim()).digest('hex');

  const user = await User.findOne({
    email,
    otpCode: hashedOtp,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    return sendError(res, 'Invalid or expired OTP code', 400);
  }

  sendSuccess(res, {
    valid: true,
    message: 'OTP verified successfully. You may now set a new password.',
  });
}));

/* POST /api/auth/reset-password */
router.post('/reset-password', authLimiter, [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
    .withMessage('Password must be at least 8 characters and include uppercase, lowercase, and a number'),
], validate, asyncHandler(async (req, res) => {
  const { email, password, otp, token } = req.body;

  let query = { email };
  if (otp) {
    query.otpCode = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    query.otpExpires = { $gt: Date.now() };
  } else if (token) {
    query.resetPasswordToken = crypto.createHash('sha256').update(token.trim()).digest('hex');
    query.resetPasswordExpires = { $gt: Date.now() };
  } else {
    return sendError(res, 'Either an OTP code or reset token is required', 400);
  }

  const user = await User.findOne(query);
  if (!user) {
    return sendError(res, 'Invalid or expired reset token/OTP', 400);
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  user.passwordChangedAt = new Date();
  await user.save();

  const jwtToken = signToken(user._id);

  sendSuccess(res, {
    message: 'Password has been successfully reset.',
    token: jwtToken,
    expiresIn: config.jwt.expiresIn,
    user: user.toAuthJSON(),
  });
}));

/* GET /api/auth/me — requires valid JWT */
router.get('/me', protect, asyncHandler(async (req, res) => {
  sendSuccess(res, {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    avatar: req.user.avatar,
    createdAt: req.user.createdAt,
  });
}));

export default router;
