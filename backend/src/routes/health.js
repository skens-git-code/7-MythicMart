/* Health check route */
import { Router } from 'express';
import mongoose from 'mongoose';
import { config } from '../config/env.js';

const router = Router();

const getDbStatus = () => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  return dbStatus[dbState] || 'unknown';
};

router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    env: config.nodeEnv,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    db: getDbStatus(),
    version: config.apiVersion,
    memory: {
      rss: process.memoryUsage().rss,
      heapUsed: process.memoryUsage().heapUsed,
    },
    requestId: req.id,
  });
});

router.get('/ready', (req, res) => {
  const ready = !config.isProduction || mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    success: ready,
    status: ready ? 'ready' : 'not_ready',
    db: getDbStatus(),
    requestId: req.id,
  });
});

export default router;
