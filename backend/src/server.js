/* MythicMart Backend — Production entry point */
import app from './app.js';
import { config, validateEnv } from './config/env.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';

/* Start server */
const startServer = async () => {
  validateEnv();
  const dbConnected = await connectDB();

  if (config.isProduction && !dbConnected) {
    throw new Error('MongoDB connection is required in production');
  }

  const server = app.listen(config.port, () => {
    console.log(`\n🚀 MythicMart API`);
    console.log(`   Environment : ${config.nodeEnv}`);
    console.log(`   Port        : ${config.port}`);
    console.log(`   URL         : http://localhost:${config.port}`);
    console.log(`   Health      : http://localhost:${config.port}/api/health\n`);
  });

  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;

  /* Graceful shutdown */
  const shutdown = (signal) => {
    console.log(`\n⚡ ${signal} received — shutting down gracefully…`);
    server.close(async () => {
      await mongoose.disconnect();
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
    /* Force exit after 10 s if server doesn't close */
    setTimeout(() => process.exit(1), 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

/* Guard against unhandled promise rejections crashing the process */
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  process.exit(1);
});

startServer();
