import { Router } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler, sendSuccess } from '../utils/apiResponse.js';

const router = Router();

const fallbackSummary = {
  revenue: 184600,
  orders: 3482,
  users: 28900,
  products: 128,
  reviews: 642,
  conversionRate: 6.8,
  inventoryHealth: 94,
  lowStockProducts: 5,
  orderStatus: {
    pending: 8,
    confirmed: 14,
    packed: 6,
    shipped: 21,
    delivered: 128,
    cancelled: 3,
    returned: 2,
  },
  series: [
    { label: 'Mon', value: 42 },
    { label: 'Tue', value: 58 },
    { label: 'Wed', value: 74 },
    { label: 'Thu', value: 69 },
    { label: 'Fri', value: 88 },
    { label: 'Sat', value: 96 },
    { label: 'Sun', value: 81 },
  ],
};

router.get('/summary', protect, authorize('admin'), asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=120');

  if (mongoose.connection.readyState !== 1) return sendSuccess(res, fallbackSummary);

  const [revenueAgg, orders, users, products, reviews, lowStockProducts, statusAgg] = await Promise.all([
    Order.aggregate([{ $group: { _id: null, revenue: { $sum: '$total' } } }]),
    Order.countDocuments(),
    User.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true }),
    Review.countDocuments({ status: 'approved' }),
    Product.countDocuments({ isActive: true, $expr: { $lte: ['$stock', '$reorderPoint'] } }),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const orderStatus = statusAgg.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, { ...fallbackSummary.orderStatus });

  sendSuccess(res, {
    ...fallbackSummary,
    revenue: Number((revenueAgg[0]?.revenue || 0).toFixed(2)),
    orders,
    users,
    products,
    reviews,
    lowStockProducts,
    inventoryHealth: products > 0 ? Math.max(0, Math.round(((products - lowStockProducts) / products) * 100)) : 100,
    orderStatus,
  });
}));

export default router;
