/* Express app — security, logging, routes, error handling */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import { config } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';
import { requestContext } from './middleware/requestContext.js';
import { sanitizeInput } from './middleware/sanitizeInput.js';

import healthRouter from './routes/health.js';
import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import ordersRouter from './routes/orders.js';
import reviewsRouter from './routes/reviews.js';
import couponsRouter from './routes/coupons.js';
import supportRouter from './routes/support.js';
import notificationsRouter from './routes/notifications.js';
import usersRouter from './routes/users.js';
import analyticsRouter from './routes/analytics.js';
import newsletterRouter from './routes/newsletter.js';
import productSyncRouter from './routes/productSync.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', config.trustProxy);
app.use(requestContext);

/* ── Security ── */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: (origin, cb) => {
    /* Allow requests with no origin (e.g. curl, Postman) */
    if (!origin || config.cors.origins.includes(origin)) return cb(null, true);
    const error = new Error('Not allowed by CORS');
    error.statusCode = 403;
    cb(error);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
}));

/* ── Logging ── */
if (!config.isTest) {
  morgan.token('id', req => req.id);
  app.use(morgan(config.isProduction ? ':id :remote-addr :method :url :status :res[content-length] - :response-time ms' : 'dev'));
}

/* ── Body Parsing ── */
app.use(express.json({ limit: config.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: config.bodyLimit }));
app.use(sanitizeInput);

/* ── Compression ── */
app.use(compression());

/* ── Rate Limiting ── */
app.use('/api', apiLimiter);

/* ── Routes ── */
app.use('/api/health', healthRouter);
app.use('/api/products/sync', productSyncRouter);
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/support', supportRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/users', usersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/newsletter', newsletterRouter);

/* ── Root Endpoint ── */
app.get('/', (req, res) => {
  res.json({
    name: 'MythicMart API',
    version: config.apiVersion,
    status: 'running',
    docs: '/api/health',
    requestId: req.id,
  });
});

/* ── 404 Handler ── */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
    requestId: req.id,
  });
});

/* ── Centralized Error Handler ── */
app.use(errorHandler);

export default app;
