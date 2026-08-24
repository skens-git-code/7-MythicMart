/* MythicMart Backend — Production entry point */
import app from './app.js';
import { config, validateEnv } from './config/env.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import { config as appConfig } from './config/env.js';
import { syncShopifyProducts, shopifySyncConfigured } from './services/shopifySyncService.js';
import { syncShopifyOrders } from './services/shopifyOrderSyncService.js';
import { syncShopifyCustomers, syncLocalCustomers } from './services/shopifyCustomerSyncService.js';

/* Start server */
const startServer = async () => {
  validateEnv();
  const dbConnected = await connectDB();
  if (dbConnected) await syncLocalCustomers().catch(error => console.error('Local customer backfill failed:', error.message));

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

  if (shopifySyncConfigured() && appConfig.shopify.syncOnStart) {
    syncShopifyProducts().catch(error => console.error('Shopify startup sync failed:', error.message));
    syncShopifyOrders().catch(error => console.error('Shopify order startup sync failed:', error.message));
    syncShopifyCustomers().catch(error => console.error('Shopify customer startup sync failed:', error.message));
  }
  if (shopifySyncConfigured() && appConfig.shopify.syncIntervalMs > 0) {
    setInterval(() => {
      syncShopifyProducts().catch(error => console.error('Shopify scheduled sync failed:', error.message));
      syncShopifyOrders().catch(error => console.error('Shopify scheduled order sync failed:', error.message));
      syncShopifyCustomers().catch(error => console.error('Shopify scheduled customer sync failed:', error.message));
    }, appConfig.shopify.syncIntervalMs).unref();
  }

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
