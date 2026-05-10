const isPlainObject = value =>
  Boolean(value) && Object.prototype.toString.call(value) === '[object Object]';

const sanitizeObject = (value) => {
  if (Array.isArray(value)) {
    value.forEach(item => sanitizeObject(item));
    return;
  }

  if (!isPlainObject(value)) return;

  Object.keys(value).forEach((key) => {
    if (key.startsWith('$') || key.includes('.')) {
      delete value[key];
      return;
    }
    sanitizeObject(value[key]);
  });
};

export const sanitizeInput = (req, res, next) => {
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  next();
};
