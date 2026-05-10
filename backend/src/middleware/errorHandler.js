/* Centralized error handler — maps Mongoose and app errors to clean JSON responses */
import { config } from '../config/env.js';

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  /* Mongoose: bad ObjectId */
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found`;
  }

  /* Mongoose: validation errors */
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join('. ');
  }

  /* MongoDB: duplicate key */
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  /* JWT errors */
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token — please log in again';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired — please log in again';
  }

  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON request body';
  }

  if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body is too large';
  }

  if (statusCode === 500 && config.isProduction) {
    message = 'Internal Server Error';
  }

  /* Hide stack traces in production */
  const response = {
    success: false,
    error: message,
    statusCode,
    requestId: req.id,
  };

  if (!config.isProduction && !config.isTest) {
    response.stack = err.stack;
  }

  if (statusCode >= 500 && !config.isTest) {
    console.error(`[${req.id}]`, err);
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
