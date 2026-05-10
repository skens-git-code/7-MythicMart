/* Consistent API response helpers */

export const sendSuccess = (res, data, statusCode = 200, meta = {}) => {
  res.status(statusCode).json({
    success: true,
    data,
    requestId: res.req?.id,
    ...meta,
  });
};

export const sendError = (res, message = 'An error occurred', statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
    requestId: res.req?.id,
  });
};

/* Wrap async route handlers — eliminates try/catch boilerplate */
export const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
