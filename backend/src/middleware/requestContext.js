import { randomUUID } from 'crypto';

export const requestContext = (req, res, next) => {
  const incomingId = req.get('x-request-id');
  req.id = incomingId && incomingId.length <= 128 ? incomingId : randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};
