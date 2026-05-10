import mongoose from 'mongoose';

export const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();

  return res.status(503).json({
    success: false,
    error: 'Database is temporarily unavailable',
    statusCode: 503,
    requestId: req.id,
  });
};
