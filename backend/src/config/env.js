import 'dotenv/config';

const toInteger = (value, fallback, { min, max } = {}) => {
  const parsed = Number.parseInt(value, 10);
  let next = Number.isFinite(parsed) ? parsed : fallback;
  if (typeof min === 'number') next = Math.max(min, next);
  if (typeof max === 'number') next = Math.min(max, next);
  return next;
};

const toList = (value, fallback = []) => {
  if (!value) return fallback;
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const defaultDevSecret = 'development-only-jwt-secret-change-before-production';
const frontendOrigins = toList(
  process.env.FRONTEND_URLS || process.env.FRONTEND_URL,
  ['http://localhost:5173', 'http://localhost:4173']
);

export const config = Object.freeze({
  nodeEnv,
  isProduction,
  isTest: nodeEnv === 'test',
  port: toInteger(process.env.PORT, 5001, { min: 1, max: 65535 }),
  apiVersion: process.env.API_VERSION || '1.0.0',
  trustProxy: toInteger(process.env.TRUST_PROXY, isProduction ? 1 : 0, { min: 0, max: 2 }),
  bodyLimit: process.env.BODY_LIMIT || '20kb',
  cors: {
    origins: frontendOrigins,
  },
  jwt: {
    secret: process.env.JWT_SECRET || defaultDevSecret,
    expiresIn: process.env.JWT_EXPIRE || '7d',
  },
  mongo: {
    uri: process.env.MONGO_URI || '',
    maxPoolSize: toInteger(process.env.MONGO_MAX_POOL_SIZE, 20, { min: 1, max: 100 }),
    minPoolSize: toInteger(process.env.MONGO_MIN_POOL_SIZE, 2, { min: 0, max: 20 }),
    serverSelectionTimeoutMS: toInteger(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS, 5000, { min: 1000 }),
    socketTimeoutMS: toInteger(process.env.MONGO_SOCKET_TIMEOUT_MS, 45000, { min: 5000 }),
  },
  rateLimit: {
    api: {
      windowMs: toInteger(process.env.API_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000, { min: 1000 }),
      max: toInteger(process.env.API_RATE_LIMIT_MAX, 300, { min: 1 }),
    },
    auth: {
      windowMs: toInteger(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000, { min: 1000 }),
      max: toInteger(process.env.AUTH_RATE_LIMIT_MAX, 20, { min: 1 }),
    },
  },
  shopify: {
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN || '',
    storefrontAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '',
    adminAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '',
    apiVersion: process.env.SHOPIFY_API_VERSION || '2025-01',
    syncOnStart: process.env.SHOPIFY_SYNC_ON_START === 'true',
    syncIntervalMs: toInteger(process.env.SHOPIFY_SYNC_INTERVAL_MS, 0, { min: 0 }),
  },
});

export const validateEnv = () => {
  const missing = [];

  if (config.isProduction) {
    if (!process.env.MONGO_URI) missing.push('MONGO_URI');
    if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
    if (config.cors.origins.length === 0) missing.push('FRONTEND_URLS');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }

  if (config.jwt.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  if (config.isProduction && (config.jwt.secret === defaultDevSecret || config.jwt.secret.includes('replace_with'))) {
    throw new Error('JWT_SECRET must be changed before production startup');
  }
};
