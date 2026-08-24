/* Auth routes — register, login, get current user */
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
