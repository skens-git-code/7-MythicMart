/* JWT auth middleware — protect routes and optionally attach user */
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/env.js';

/* Requires valid JWT — blocks request if missing or invalid */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Not authorized — no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/* Attaches user if token present — does NOT block unauthenticated requests */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch {
    /* Invalid token — continue as guest */
    next();
  }
};

/* Restrict to specific roles */
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ success: false, error: 'Forbidden — insufficient permissions' });
  }
  next();
};
