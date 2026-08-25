import { Router } from 'express';
import mongoose from 'mongoose';
import { param, query, validationResult } from 'express-validator';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import { protect, authorize } from '../middleware/auth.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { asyncHandler, sendError, sendSuccess } from '../utils/apiResponse.js';
import { syncShopifyCustomers, getShopifyCustomerSyncStatus } from '../services/shopifyCustomerSyncService.js';

const router = Router();
router.use(requireDatabase, protect, authorize('admin', 'manager', 'support'));
const validate = (req, res, next) => { const errors = validationResult(req); if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422); next(); };
router.get('/sync/status', asyncHandler(async (req, res) => sendSuccess(res, await getShopifyCustomerSyncStatus())));
router.post('/sync', authorize('admin', 'manager'), asyncHandler(async (req, res) => { try { return sendSuccess(res, await syncShopifyCustomers()); } catch (error) { return sendError(res, error.message || 'Customer synchronization failed', 502); } }));
router.get('/', [query('page').optional().isInt({ min: 1 }).toInt(), query('limit').optional().isInt({ min: 1, max: 100 }).toInt(), query('search').optional().trim().isLength({ max: 80 }), query('status').optional().isIn(['all', 'active', 'disabled', 'guest', 'unknown']), query('sort').optional().isIn(['newest', 'oldest', 'orders', 'spend', 'name'])], validate, asyncHandler(async (req, res) => {
  const { page = 1, limit = 25, search, status, sort = 'newest' } = req.query; const pageNumber = Number(page); const limitNumber = Number(limit); const filter = {};
  if (status && status !== 'all') filter.status = status;
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } },
      { phone: { $regex: escaped, $options: 'i' } },
    ];
  }
  const sortBy = sort === 'oldest' ? { createdAt: 1 } : sort === 'orders' ? { orderCount: -1, createdAt: -1 } : sort === 'spend' ? { totalSpent: -1, createdAt: -1 } : sort === 'name' ? { name: 1 } : { createdAt: -1 };
  const [customers, total] = await Promise.all([Customer.find(filter).sort(sortBy).skip((pageNumber - 1) * limitNumber).limit(limitNumber).select('-addresses').lean(), Customer.countDocuments(filter)]);
  sendSuccess(res, customers, 200, { pagination: { page: pageNumber, limit: limitNumber, total, pages: Math.ceil(total / limitNumber) } });
}));
router.get('/:id', [param('id').trim().isLength({ min: 1, max: 160 })], validate, asyncHandler(async (req, res) => {
  const filter = mongoose.isValidObjectId(req.params.id) ? { _id: req.params.id } : { $or: [{ shopifyCustomerId: req.params.id }, { email: req.params.id }] };
  const customer = await Customer.findOne(filter).populate('user', 'name email role isActive').lean();
  if (!customer) return sendError(res, 'Customer not found', 404);
  const orderFilter = [];
  if (customer.shopifyCustomerId) orderFilter.push({ 'customer.shopifyCustomerId': customer.shopifyCustomerId });
  if (customer.email) orderFilter.push({ guestEmail: customer.email });
  if (customer.user?._id) orderFilter.push({ user: customer.user._id });
  const orders = orderFilter.length ? await Order.find({ $or: orderFilter }).sort({ createdAt: -1 }).limit(50).select('orderNumber shopifyOrderId total currency status fulfillmentStatus createdAt items').lean() : [];
  sendSuccess(res, { ...customer, orders });
}));
export default router;
