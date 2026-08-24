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
  revenue: 0,
  orders: 0,
  users: 0,
  products: 0,
  reviews: 0,
  conversionRate: 0,
  inventoryHealth: 100,
  lowStockProducts: 0,
  orderStatus: {
    pending: 0, confirmed: 0, packed: 0, shipped: 0, delivered: 0, cancelled: 0, returned: 0,
  },
  series: [

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
