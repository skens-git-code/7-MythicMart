import { Router } from 'express';
import { asyncHandler, sendError, sendSuccess } from '../utils/apiResponse.js';
import { protect, authorize } from '../middleware/auth.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { syncShopifyProducts, getShopifySyncStatus, verifyShopifyConnection, shopifySyncConfigured } from '../services/shopifySyncService.js';
import { config } from '../config/env.js';

const router = Router();
router.use(requireDatabase, protect, authorize('admin', 'manager'));

router.get('/status', asyncHandler(async (req, res) => sendSuccess(res, {
  configured: shopifySyncConfigured(),
  storeDomain: config.shopify.storeDomain ? config.shopify.storeDomain.replace(/^https?:\/\//, '') : null,
  apiVersion: config.shopify.apiVersion,
  lastRun: await getShopifySyncStatus(),
})));
router.get('/connection', asyncHandler(async (req, res) => {
  try {
    return sendSuccess(res, await verifyShopifyConnection());
  } catch (error) {
    return sendSuccess(res, { configured: true, connection: 'error', error: error.message });
  }
}));
router.post('/', asyncHandler(async (req, res) => {
  try {
    return sendSuccess(res, await syncShopifyProducts(), 200);
  } catch (error) {
    return sendError(res, error.message || 'Shopify synchronization failed', 502);
  }
}));

export default router;
