import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

let mongod = null;

const productsSeed = [
  { name: 'Obsidian Chronograph', description: 'Precision-engineered timepiece with sapphire crystal.', price: 199, originalPrice: 249, category: 'accessories', image: '/assets/product-watch.png', badge: 'Best Seller', stock: 12, freeShipping: true, rating: 4.8, reviewCount: 124, brand: 'Mythic Atelier', collectionName: 'Signature Edit', accent: '#2563eb', aiScore: 98, salesCount: 920, featured: true, recommendationTags: ['luxury', 'accessories', 'gift'], slug: 'obsidian-chronograph' },
  { name: 'Midnight Leather Tote', description: 'Hand-stitched Italian leather, timeless silhouette.', price: 129, originalPrice: null, category: 'bags', image: '/assets/product-bag.png', badge: null, stock: 8, freeShipping: true, rating: 4.6, reviewCount: 89, brand: 'Nocturne Goods', collectionName: 'Executive Carry', accent: '#f97316', aiScore: 91, salesCount: 610, featured: false, recommendationTags: ['bags', 'work', 'leather'], slug: 'midnight-leather-tote' },
  { name: 'Carbon Fiber Sunglasses', description: 'Ultra-light polarized lenses with matte finish.', price: 139, originalPrice: 179, category: 'accessories', image: '/assets/product-sunglasses.png', badge: 'New', stock: 24, freeShipping: false, rating: 4.5, reviewCount: 67, brand: 'Vector Shade', collectionName: 'Aero Carbon', accent: '#06b6d4', aiScore: 94, salesCount: 480, featured: false, recommendationTags: ['accessories', 'travel', 'summer'], slug: 'carbon-fiber-sunglasses' },
  { name: 'Onyx Wireless Earbuds', description: 'Studio-quality sound in a minimal design.', price: 149, originalPrice: null, category: 'electronics', image: '/assets/product-earbuds.png', badge: 'Trending', stock: 5, freeShipping: true, rating: 4.9, reviewCount: 203, brand: 'Sequoia Labs', collectionName: 'Signal Sound', accent: '#10b981', aiScore: 99, salesCount: 1280, featured: true, recommendationTags: ['electronics', 'audio', 'commute'], slug: 'onyx-wireless-earbuds' },
];

export const seedInitialTestData = async () => {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(productsSeed);
  }

  const couponCount = await Coupon.countDocuments();
  if (couponCount === 0) {
    await Coupon.create([
      {
        code: 'MYTHIC10',
        type: 'percent',
        value: 10,
        minSubtotal: 50,
        maxDiscount: 50,
        active: true,
      },
      {
        code: 'WELCOME50',
        type: 'fixed',
        value: 50,
        minSubtotal: 200,
        active: true,
      },
    ]);
  }
};

export const ensureTestDb = async () => {
  if (mongoose.connection.readyState === 1) {
    await seedInitialTestData();
    return;
  }

  try {
    if (process.env.MONGO_URI && !process.env.MONGO_URI.includes('localhost')) {
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 1500 });
      await seedInitialTestData();
      return;
    }
  } catch (err) {
    // Fallback to in-memory server
  }

  if (!mongod) {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    await seedInitialTestData();
  }
};

export const closeTestDb = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
};
