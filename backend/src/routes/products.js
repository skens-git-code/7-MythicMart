/* Products route — paginated list, search, category filter, single product */
import { Router } from 'express';
import mongoose from 'mongoose';
import { param, query, validationResult } from 'express-validator';
import Product from '../models/Product.js';
import { asyncHandler, sendSuccess, sendError } from '../utils/apiResponse.js';

/* Static fallback products (used when MongoDB is not connected) */
const STATIC_PRODUCTS = [
  { id: 1, slug: 'obsidian-chronograph', name: 'Obsidian Chronograph', brand: 'Mythic Atelier', collection: 'Signature Edit', accent: '#2563eb', aiScore: 98, salesCount: 920, featured: true, description: 'Precision-engineered timepiece with sapphire crystal.', price: 199, originalPrice: 249, category: 'accessories', image: '/assets/product-watch.png', badge: 'Best Seller', stock: 12, freeShipping: true, rating: 4.8, reviewCount: 124 },
  { id: 2, slug: 'midnight-leather-tote', name: 'Midnight Leather Tote', brand: 'Nocturne Goods', collection: 'Executive Carry', accent: '#f97316', aiScore: 91, salesCount: 610, featured: false, description: 'Hand-stitched Italian leather, timeless silhouette.', price: 129, originalPrice: null, category: 'bags', image: '/assets/product-bag.png', badge: null, stock: 8, freeShipping: true, rating: 4.6, reviewCount: 89 },
  { id: 3, slug: 'carbon-fiber-sunglasses', name: 'Carbon Fiber Sunglasses', brand: 'Vector Shade', collection: 'Aero Carbon', accent: '#06b6d4', aiScore: 94, salesCount: 480, featured: false, description: 'Ultra-light polarized lenses with matte finish.', price: 139, originalPrice: 179, category: 'accessories', image: '/assets/product-sunglasses.png', badge: 'New', stock: 24, freeShipping: false, rating: 4.5, reviewCount: 67 },
  { id: 4, slug: 'onyx-wireless-earbuds', name: 'Onyx Wireless Earbuds', brand: 'Sequoia Labs', collection: 'Signal Sound', accent: '#10b981', aiScore: 99, salesCount: 1280, featured: true, description: 'Studio-quality sound in a minimal design.', price: 149, originalPrice: null, category: 'electronics', image: '/assets/product-earbuds.png', badge: 'Trending', stock: 5, freeShipping: true, rating: 4.9, reviewCount: 203 },
  { id: 5, slug: 'phantom-runner-pro', name: 'Phantom Runner Pro', brand: 'Kinetic House', collection: 'Motion System', accent: '#d946ef', aiScore: 93, salesCount: 430, featured: true, description: 'Featherlight performance running shoes with carbon plate.', price: 189, originalPrice: 229, category: 'footwear', image: '/assets/product-watch.png', badge: 'New', stock: 15, freeShipping: true, rating: 4.7, reviewCount: 58 },
  { id: 6, slug: 'eclipse-merino-pullover', name: 'Eclipse Merino Pullover', brand: 'Northline Studio', collection: 'Soft Utility', accent: '#64748b', aiScore: 88, salesCount: 310, featured: false, description: 'Ultra-soft 100% merino wool in midnight black.', price: 119, originalPrice: null, category: 'clothing', image: '/assets/product-bag.png', badge: null, stock: 20, freeShipping: false, rating: 4.4, reviewCount: 41 },
  { id: 7, slug: 'titanium-card-wallet', name: 'Titanium Card Wallet', brand: 'Vaultform', collection: 'Everyday Armor', accent: '#84cc16', aiScore: 96, salesCount: 760, featured: true, description: 'Aircraft-grade titanium with RFID blocking.', price: 79, originalPrice: 99, category: 'accessories', image: '/assets/product-sunglasses.png', badge: 'Best Seller', stock: 30, freeShipping: true, rating: 4.6, reviewCount: 176 },
  { id: 8, slug: 'noir-smart-speaker', name: 'Noir Smart Speaker', brand: 'Roomtone', collection: 'Home Signal', accent: '#ef4444', aiScore: 92, salesCount: 540, featured: false, description: 'Room-filling sound in a sleek matte black cylinder.', price: 229, originalPrice: 279, category: 'electronics', image: '/assets/product-earbuds.png', badge: 'Sale', stock: 9, freeShipping: true, rating: 4.7, reviewCount: 92 },
];

const router = Router();
const isDbConnected = () => mongoose.connection.readyState === 1;
const allowedSorts = ['newest', 'price-asc', 'price-desc', 'rating', 'relevance'];
const setCatalogCache = (res, maxAge = 60) => {
  res.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 5}`);
};

const normalizeProduct = (product) => {
  const { _id, __v, ...rest } = product;
  return {
    id: rest.id || _id?.toString(),
    collection: rest.collection || rest.collectionName,
    ...rest,
    collectionName: undefined,
  };
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
  const { page = 1, limit = 20, category, sort = 'newest', search } = req.query;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  if (!isDbConnected()) {
    let products = STATIC_PRODUCTS;
    if (category && category !== 'all') {
      products = products.filter(p => p.category === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    const sorters = {
      newest: (a, b) => b.id - a.id,
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      relevance: (a, b) => b.rating - a.rating,
    };
    products = [...products].sort(sorters[sort] || sorters.newest);
    const total = products.length;
    products = products.slice(skip, skip + limitNumber);
    setCatalogCache(res);
    return sendSuccess(res, products, 200, {
      pagination: { page: pageNumber, limit: limitNumber, total, pages: Math.ceil(total / limitNumber) },
    });
  }

  const query = { isActive: true };
  if (category && category !== 'all') query.category = category.toLowerCase();
  if (search) query.$text = mongoose.trusted({ $search: search });

  const sortOptions = {
    newest: { createdAt: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    rating: { rating: -1 },
    relevance: search ? { score: { $meta: 'textScore' } } : { createdAt: -1 },
  };

  const projection = search ? { score: { $meta: 'textScore' } } : {};
  const productQuery = Product.find(query, projection)
    .sort(sortOptions[sort] || (search ? sortOptions.relevance : sortOptions.newest))
    .skip(skip)
    .limit(limitNumber)
    .lean();
  const countQuery = Product.countDocuments(query);

  if (search) {
    productQuery.setOptions({ sanitizeFilter: false });
    countQuery.setOptions({ sanitizeFilter: false });
  }

  const [products, total] = await Promise.all([productQuery, countQuery]);

  setCatalogCache(res);
  sendSuccess(res, products.map(normalizeProduct), 200, {
    pagination: { page: pageNumber, limit: limitNumber, total, pages: Math.ceil(total / limitNumber) },
  });
}));

/* GET /api/products/search?q= — full-text search */
router.get('/search', searchRules, validate, asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!isDbConnected()) {
    const results = STATIC_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.description.toLowerCase().includes(q.toLowerCase())
    );
    return sendSuccess(res, results);
  }

  const products = await Product.find(
    { $text: mongoose.trusted({ $search: q }), isActive: true },
    { score: { $meta: 'textScore' } }
  )
    .setOptions({ sanitizeFilter: false })
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .lean();

  setCatalogCache(res);
  sendSuccess(res, products.map(normalizeProduct));
}));

/* GET /api/products/recommendations — AI-style ranked product set */
router.get('/recommendations', recommendationRules, validate, asyncHandler(async (req, res) => {
  const { category, limit = 6 } = req.query;
  const limitNumber = Number(limit);

  if (!isDbConnected()) {
    let products = [...STATIC_PRODUCTS];
    if (category && category !== 'all') products = products.filter(p => p.category === category.toLowerCase());
    products = products
      .sort((a, b) => (b.featured - a.featured) || b.aiScore - a.aiScore || b.rating - a.rating || b.salesCount - a.salesCount)
      .slice(0, limitNumber);
    setCatalogCache(res, 90);
    return sendSuccess(res, products);
  }

  const query = { isActive: true };
  if (category && category !== 'all') query.category = category.toLowerCase();

  const products = await Product.find(query)
    .sort({ featured: -1, aiScore: -1, rating: -1, salesCount: -1 })
    .limit(limitNumber)
    .lean();

  setCatalogCache(res, 90);
  sendSuccess(res, products.map(normalizeProduct));
}));

/* GET /api/products/trending — merchandising surface for homepage/dashboard cards */
router.get('/trending', recommendationRules, validate, asyncHandler(async (req, res) => {
  const { category, limit = 8 } = req.query;
  const limitNumber = Number(limit);

  if (!isDbConnected()) {
    let products = [...STATIC_PRODUCTS];
    if (category && category !== 'all') products = products.filter(p => p.category === category.toLowerCase());
    products = products
      .sort((a, b) => b.salesCount - a.salesCount || b.reviewCount - a.reviewCount || b.rating - a.rating)
      .slice(0, limitNumber);
    setCatalogCache(res, 60);
    return sendSuccess(res, products);
  }

  const query = { isActive: true };
  if (category && category !== 'all') query.category = category.toLowerCase();

  const products = await Product.find(query)
    .sort({ salesCount: -1, viewCount: -1, rating: -1 })
    .limit(limitNumber)
    .lean();

  setCatalogCache(res, 60);
  sendSuccess(res, products.map(normalizeProduct));
}));

/* GET /api/products/:id — single product by MongoDB id or slug */
router.get('/:id', idRules, validate, asyncHandler(async (req, res) => {
  if (!isDbConnected()) {
    const product = STATIC_PRODUCTS.find(p => String(p.id) === req.params.id);
    if (!product) return sendError(res, 'Product not found', 404);
    return sendSuccess(res, product);
  }

  const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { slug: req.params.id };
  const product = await Product.findOne({ ...query, isActive: true }).lean();
  if (!product) return sendError(res, 'Product not found', 404);
  setCatalogCache(res, 120);
  sendSuccess(res, normalizeProduct(product));
}));

export default router;
