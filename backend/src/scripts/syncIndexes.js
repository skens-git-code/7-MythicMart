import mongoose from 'mongoose';
import { config, validateEnv } from '../config/env.js';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';
import Notification from '../models/Notification.js';
import SupportTicket from '../models/SupportTicket.js';

const run = async () => {
  validateEnv();
  const connected = await connectDB();
  if (!connected) {
    throw new Error('Cannot sync indexes without MongoDB');
  }

  const models = [User, Product, Order, Review, Coupon, Notification, SupportTicket];
  for (const model of models) {
    await model.syncIndexes();
    console.log(`Synced indexes for ${model.modelName}`);
  }

  await mongoose.disconnect();
  console.log(`Index sync complete for ${config.nodeEnv}`);
};

run().catch(async (err) => {
  console.error(err.message);
  await mongoose.disconnect();
  process.exit(1);
});
