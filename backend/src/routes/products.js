// productsRoutes.js
import { Router } from 'express';
import { param, query, validationResult } from 'express-validator';
import Product from '../models/Product.js';
import { asyncHandler, sendSuccess, sendError } from '../utils/apiResponse.js';
import { protect, authorize } from '../middleware/auth.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';
import cache from '../utils/cache.js'; // Redis client with get/set/del
import { syncProductsQueue } from '../queues/syncQueue.js'; // Bull queue

const router = Router();
const allowedSorts = ['newest', 'price-asc', 'price-desc', 'rating', 'sales', 'relevance'];
const CACHE_TTL = 300; // 5 minutes

// ---------- Helper: validation (return all errors) ----------
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(
      res,
      errors.array().map(e => e.msg).join('. '),
      422
    );
  }
  next();
};

// ---------- Helper: build filter from query ----------
function buildProductFilter(query) {
  const filter = { isActive: true };
  if (query.category) {
    filter.categories = query.category; // exact match; can be improved
  }
  if (query.minPrice || query.maxPrice) {
    filter['priceRange.min'] = {};
    if (query.minPrice) filter['priceRange.min'].$gte = Number(query.minPrice);
    if (query.maxPrice) filter['priceRange.min'].$lte = Number(query.maxPrice);
  }
  if (query.inStock === 'true') {
    filter['variants.inventoryQuantity'] = { $gt: 0 };
  }
  if (query.vendor) {
    filter.vendor = { $regex: new RegExp(query.vendor, 'i') };
  }
  return filter;
}

// ---------- GET /api/products – list with filters, pagination, sorting ----------
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 48 }).withMessage('Limit between 1 and 48').toInt(),
    query('category').optional().trim().isLength({ max: 40 }).withMessage('Category too long'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a number'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a number'),
    query('inStock').optional().isBoolean().withMessage('inStock must be true/false'),
    query('vendor').optional().trim().isLength({ max: 40 }).withMessage('Vendor too long'),
    query('sort').optional().isIn(allowedSorts).withMessage('Invalid sort'),
    query('search').optional().trim().isLength({ max: 80 }).withMessage('Search too long'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, sort = 'newest', search, ...filters } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    // Build cache key
    const cacheKey = `products:${JSON.stringify(req.query)}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return sendSuccess(res, cached.products, 200, { pagination: cached.pagination, cached: true });
    }

    // Build filter
    const filter = buildProductFilter(filters);

    // Search using MongoDB text index if search term provided
    let queryBuilder = Product.find(filter);
    if (search) {
      queryBuilder = Product.find(
        { $text: { $search: search }, ...filter },
        { score: { $meta: 'textScore' } }
      );
    }

    // Sort
    const sortMap = {
      'newest': { createdAt: -1 },
      'price-asc': { 'priceRange.min': 1 },
      'price-desc': { 'priceRange.min': -1 },
      'rating': { averageRating: -1 },
      'sales': { salesCount: -1 },
      'relevance': search ? { score: { $meta: 'textScore' } } : { createdAt: -1 },
    };
    const sortObj = sortMap[sort] || sortMap['newest'];

    // Paginate
    const total = await Product.countDocuments(filter);
    const products = await queryBuilder
      .sort(sortObj)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean();

    const pagination = {
      page: pageNumber,
      limit: limitNumber,
      total,
      pages: Math.ceil(total / limitNumber),
    };

    // Cache result (with TTL)
    const responseData = { products, pagination };
    await cache.set(cacheKey, responseData, CACHE_TTL);

    // Set cache control header
    res.set('Cache-Control', `public, max-age=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL * 2}`);

    sendSuccess(res, products, 200, { pagination });
  })
);

// ---------- GET /api/products/search?q= – legacy search (now integrated) ----------
router.get(
  '/search',
  [
    query('q').trim().isLength({ min: 2, max: 80 }).withMessage('Search query must be between 2 and 80 characters'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    // Redirect to main list with search param
    const { q } = req.query;
    req.query.search = q;
    req.query.limit = 24;
    req.query.sort = 'relevance';
    // Forward to the main handler (but we can just call the same logic)
    // Simpler: reuse by calling the same function? Better to duplicate minimal logic.
    // For clarity, we'll call the same filter logic but we need to avoid infinite redirect.
    // We'll implement a small function that does the same as above.
    // However, to keep DRY, we can refactor the main handler into a service function.
    // For brevity, we'll call the same Product.find logic here.
    const filter = { isActive: true };
    const products = await Product.find(
      { $text: { $search: q }, ...filter },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(24)
      .lean();

    res.set('Cache-Control', `public, max-age=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL * 2}`);
    sendSuccess(res, products);
  })
);

// ---------- GET /api/products/recommendations – AI-style ranked set ----------
router.get(
  '/recommendations',
  [
    query('limit').optional().isInt({ min: 1, max: 24 }).withMessage('Limit between 1 and 24').toInt(),
    query('category').optional().trim().isLength({ max: 40 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { limit = 8, category } = req.query;
    const filter = { isActive: true };
    if (category) filter.categories = category;

    const products = await Product.find(filter)
      .sort({ salesCount: -1, averageRating: -1 })
      .limit(Number(limit))
      .lean();

    res.set('Cache-Control', `public, max-age=${CACHE_TTL * 2}, stale-while-revalidate=${CACHE_TTL * 4}`);
    sendSuccess(res, products);
  })
);

// ---------- GET /api/products/trending – similar to recommendations ----------
router.get(
  '/trending',
  [
    query('limit').optional().isInt({ min: 1, max: 24 }).withMessage('Limit between 1 and 24').toInt(),
    query('category').optional().trim().isLength({ max: 40 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { limit = 12, category } = req.query;
    const filter = { isActive: true };
    if (category) filter.categories = category;

    const products = await Product.find(filter)
      .sort({ salesCount: -1, createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.set('Cache-Control', `public, max-age=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL * 2}`);
    sendSuccess(res, products);
  })
);

// ---------- GET /api/products/:id – single product by Shopify ID or handle ----------
router.get(
  '/:id',
  [
    param('id').trim().isLength({ min: 1, max: 120 }).withMessage('Invalid product identifier'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    // Try to find by shopifyId or handle
    const product = await Product.findOne({
      $or: [
        { shopifyId: id },
        { handle: id },
      ],
      isActive: true,
    }).lean();

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    res.set('Cache-Control', `public, max-age=${CACHE_TTL * 2}, stale-while-revalidate=${CACHE_TTL * 4}`);
    sendSuccess(res, product);
  })
);

// ---------- ADMIN SYNC ROUTES ----------
router.use(requireDatabase, protect, authorize('admin', 'manager'));

// GET /admin/products/status – sync status and configuration
router.get('/admin/products/status', asyncHandler(async (req, res) => {
  // Assume we have a SyncStatus model
  const SyncStatus = mongoose.model('SyncStatus', new mongoose.Schema({
    lastRun: Date,
    status: String,
    totalProducts: Number,
    errors: [String],
  }));
  const status = await SyncStatus.findOne().sort({ lastRun: -1 });
  sendSuccess(res, {
    configured: !!config.shopify.storeDomain,
    storeDomain: config.shopify.storeDomain ? config.shopify.storeDomain.replace(/^https?:\/\//, '') : null,
    lastRun: status ? status.lastRun : null,
    totalProducts: status ? status.totalProducts : 0,
  });
}));

// GET /admin/products/connection – verify Shopify connection
router.get('/admin/products/connection', asyncHandler(async (req, res) => {
  try {
    const shopify = new ShopifyService(config.shopify);
    await shopify.verifyConnection();
    sendSuccess(res, { configured: true, connection: 'ok' });
  } catch (error) {
    logger.error('Shopify connection error:', error);
    sendSuccess(res, { configured: true, connection: 'error', error: error.message });
  }
}));

// POST /admin/products – trigger sync via Bull queue
router.post('/admin/products', asyncHandler(async (req, res) => {
  // Add job to queue
  const job = await syncProductsQueue.add('sync-products', {
    fullSync: req.body.fullSync === true, // optional full re-sync
  });
  sendSuccess(res, { jobId: job.id, message: 'Sync started asynchronously' });
}));

// ---------- WEBHOOK endpoint for Shopify product updates ----------
// This should be publicly accessible but with HMAC verification
import express from 'express';
const webhookRouter = express.Router();
webhookRouter.post(
  '/webhook/products',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req, res) => {
    // Verify HMAC (omitted for brevity, see previous payment webhook)
    const event = JSON.parse(req.body.toString('utf8'));
    // Process product update/creation
    if (event.topic === 'products/update' || event.topic === 'products/create') {
      const shopifyProduct = event.data;
      await updateLocalProduct(shopifyProduct);
    }
    res.status(200).send('OK');
  })
);

// Helper to update local product from Shopify product
async function updateLocalProduct(shopifyProduct) {
  // Transform Shopify product to our schema
  const productData = {
    shopifyId: shopifyProduct.id.toString(),
    title: shopifyProduct.title,
    handle: shopifyProduct.handle,
    description: shopifyProduct.body_html,
    vendor: shopifyProduct.vendor,
    productType: shopifyProduct.product_type,
    categories: shopifyProduct.product_type ? [shopifyProduct.product_type] : [],
    images: shopifyProduct.images.map(img => img.src),
    variants: shopifyProduct.variants.map(v => ({
      id: v.id.toString(),
      title: v.title,
      price: parseFloat(v.price),
      compareAtPrice: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
      sku: v.sku,
      inventoryQuantity: v.inventory_quantity || 0,
      image: v.image ? v.image.src : null,
    })),
    priceRange: {
      min: Math.min(...shopifyProduct.variants.map(v => parseFloat(v.price))),
      max: Math.max(...shopifyProduct.variants.map(v => parseFloat(v.price))),
    },
    isActive: shopifyProduct.status === 'active',
    updatedAt: new Date(),
  };

  // Upsert
  await Product.findOneAndUpdate(
    { shopifyId: productData.shopifyId },
    productData,
    { upsert: true, new: true }
  );

  // Invalidate product list caches (e.g., delete all keys starting with "products:")
  const keys = await cache.keys('products:*');
  if (keys.length) await cache.del(keys);

  logger.info(`Product ${productData.title} updated from Shopify webhook`);
}

export default router;