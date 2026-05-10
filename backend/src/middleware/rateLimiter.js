/* Rate limiters — general API and strict auth limiter */
import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

/* General API limiter */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.api.windowMs,
  max: config.rateLimit.api.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      statusCode: 429,
      requestId: req.id,
    });
  },
  skip: () => config.isTest,
});

/* Auth limiter with tighter brute-force protection */
export const authLimiter = rateLimit({
  windowMs: config.rateLimit.auth.windowMs,
  max: config.rateLimit.auth.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts. Please try again later.',
      statusCode: 429,
      requestId: req.id,
    });
  },
  skipSuccessfulRequests: true,
  skip: () => config.isTest,
});
