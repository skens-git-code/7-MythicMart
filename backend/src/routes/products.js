/* Products route — paginated list, search, category filter, single product */
import { Router } from 'express';
import { param, query, validationResult } from 'express-validator';
import * as shopifyService from '../services/shopifyService.js';
import { asyncHandler, sendSuccess, sendError } from '../utils/apiResponse.js';

const router = Router();
const allowedSorts = ['newest', 'price-asc', 'price-desc', 'rating', 'relevance'];
const setCatalogCache = (res, maxAge = 60) => {
  res.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 5}`);
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 422);
  }
  next();
};

const listRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 48 }).withMessage('Limit must be between 1 and 48').toInt(),
  query('category').optional().trim().isLength({ max: 40 }).withMessage('Category is too long'),
  query('sort').optional().isIn(allowedSorts).withMessage('Invalid sort option'),
  query('search').optional().trim().isLength({ max: 80 }).withMessage('Search query is too long'),
];

const searchRules = [
  query('q').trim().isLength({ min: 2, max: 80 }).withMessage('Search query must be between 2 and 80 characters'),
];

const recommendationRules = [
  query('category').optional().trim().isLength({ max: 40 }).withMessage('Category is too long'),
  query('limit').optional().isInt({ min: 1, max: 24 }).withMessage('Limit must be between 1 and 24').toInt(),
];

const idRules = [
  param('id').trim().isLength({ min: 1, max: 120 }).withMessage('Invalid product identifier'),
];

/* GET /api/products — list with optional pagination, category, search, sort */
router.get('/', listRules, validate, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sort = 'newest', category, search } = req.query;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  // Map sort options to Shopify SortKeys
  const sortMap = {
    'newest': { sortKey: 'CREATED_AT', reverse: true },
    'price-asc': { sortKey: 'PRICE', reverse: false },
    'price-desc': { sortKey: 'PRICE', reverse: true },
    'rating': { sortKey: 'BEST_SELLING', reverse: true },
    'relevance': { sortKey: 'RELEVANCE', reverse: false },
  };

  const { sortKey, reverse } = sortMap[sort] || sortMap['newest'];

  const result = await shopifyService.getProducts({
    limit: limitNumber,
    page: pageNumber,
    sortKey,
    reverse,
    query: search || '',
    category: category || '',
  });

  setCatalogCache(res);
  sendSuccess(res, result.products, 200, {
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages: result.pages,
    },
  });
}));

/* GET /api/products/search?q= — full-text search */
router.get('/search', searchRules, validate, asyncHandler(async (req, res) => {
  const { q } = req.query;

  const result = await shopifyService.getProducts({
    limit: 24,
    sortKey: 'RELEVANCE',
    reverse: false,
    query: q,
  });

  setCatalogCache(res);
  sendSuccess(res, result.products);
}));

/* GET /api/products/recommendations — AI-style ranked product set */
router.get('/recommendations', recommendationRules, validate, asyncHandler(async (req, res) => {
  const { limit = 8, category } = req.query;
  const limitNumber = Number(limit);

  const result = await shopifyService.getProducts({
    limit: limitNumber,
    sortKey: 'BEST_SELLING',
    reverse: true,
    category: category || '',
  });

  setCatalogCache(res, 90);
  sendSuccess(res, result.products);
}));

/* GET /api/products/trending — merchandising surface for homepage/dashboard cards */
router.get('/trending', recommendationRules, validate, asyncHandler(async (req, res) => {
  const { limit = 12, category } = req.query;
  const limitNumber = Number(limit);

  const result = await shopifyService.getProducts({
    limit: limitNumber,
    sortKey: 'BEST_SELLING',
    reverse: true,
    category: category || '',
  });

  setCatalogCache(res, 60);
  sendSuccess(res, result.products);
}));

/* GET /api/products/:id — single product by Shopify ID or handle */
router.get('/:id', idRules, validate, asyncHandler(async (req, res) => {
  const product = await shopifyService.getProductById(req.params.id);
  
  if (!product) {
    return sendError(res, 'Product not found', 404);
  }
  
  setCatalogCache(res, 120);
  sendSuccess(res, product);
}));

export default router;
