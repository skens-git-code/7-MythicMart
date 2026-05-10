/* Seed script — idempotent, clears and reseeds 8 products */
import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

const products = [
  { name: 'Obsidian Chronograph', description: 'Precision-engineered timepiece with sapphire crystal.', price: 199, originalPrice: 249, category: 'accessories', image: '/assets/product-watch.png', badge: 'Best Seller', stock: 12, freeShipping: true, rating: 4.8, reviewCount: 124 },
  { name: 'Midnight Leather Tote', description: 'Hand-stitched Italian leather, timeless silhouette.', price: 129, originalPrice: null, category: 'bags', image: '/assets/product-bag.png', badge: null, stock: 8, freeShipping: true, rating: 4.6, reviewCount: 89 },
  { name: 'Carbon Fiber Sunglasses', description: 'Ultra-light polarized lenses with matte finish.', price: 139, originalPrice: 179, category: 'accessories', image: '/assets/product-sunglasses.png', badge: 'New', stock: 24, freeShipping: false, rating: 4.5, reviewCount: 67 },
  { name: 'Onyx Wireless Earbuds', description: 'Studio-quality sound in a minimal design.', price: 149, originalPrice: null, category: 'electronics', image: '/assets/product-earbuds.png', badge: 'Trending', stock: 5, freeShipping: true, rating: 4.9, reviewCount: 203 },
  { name: 'Phantom Runner Pro', description: 'Featherlight performance running shoes with carbon plate.', price: 189, originalPrice: 229, category: 'footwear', image: '/assets/product-watch.png', badge: 'New', stock: 15, freeShipping: true, rating: 4.7, reviewCount: 58 },
  { name: 'Eclipse Merino Pullover', description: 'Ultra-soft 100% merino wool, ethically sourced.', price: 119, originalPrice: null, category: 'clothing', image: '/assets/product-bag.png', badge: null, stock: 20, freeShipping: false, rating: 4.4, reviewCount: 41 },
  { name: 'Titanium Card Wallet', description: 'Aircraft-grade titanium with RFID blocking.', price: 79, originalPrice: 99, category: 'accessories', image: '/assets/product-sunglasses.png', badge: 'Best Seller', stock: 30, freeShipping: true, rating: 4.6, reviewCount: 176 },
  { name: 'Noir Smart Speaker', description: 'Room-filling sound in a sleek matte black cylinder.', price: 229, originalPrice: 279, category: 'electronics', image: '/assets/product-earbuds.png', badge: 'Sale', stock: 9, freeShipping: true, rating: 4.7, reviewCount: 92 },
];

const productMetadata = {
  'Obsidian Chronograph': { brand: 'Mythic Atelier', collectionName: 'Signature Edit', accent: '#2563eb', aiScore: 98, salesCount: 920, featured: true, recommendationTags: ['luxury', 'accessories', 'gift'] },
  'Midnight Leather Tote': { brand: 'Nocturne Goods', collectionName: 'Executive Carry', accent: '#f97316', aiScore: 91, salesCount: 610, featured: false, recommendationTags: ['bags', 'work', 'leather'] },
  'Carbon Fiber Sunglasses': { brand: 'Vector Shade', collectionName: 'Aero Carbon', accent: '#06b6d4', aiScore: 94, salesCount: 480, featured: false, recommendationTags: ['accessories', 'travel', 'summer'] },
  'Onyx Wireless Earbuds': { brand: 'Sequoia Labs', collectionName: 'Signal Sound', accent: '#10b981', aiScore: 99, salesCount: 1280, featured: true, recommendationTags: ['electronics', 'audio', 'commute'] },
  'Phantom Runner Pro': { brand: 'Kinetic House', collectionName: 'Motion System', accent: '#d946ef', aiScore: 93, salesCount: 430, featured: true, recommendationTags: ['footwear', 'fitness', 'performance'] },
  'Eclipse Merino Pullover': { brand: 'Northline Studio', collectionName: 'Soft Utility', accent: '#64748b', aiScore: 88, salesCount: 310, featured: false, recommendationTags: ['clothing', 'winter', 'comfort'] },
  'Titanium Card Wallet': { brand: 'Vaultform', collectionName: 'Everyday Armor', accent: '#84cc16', aiScore: 96, salesCount: 760, featured: true, recommendationTags: ['accessories', 'minimal', 'wallet'] },
  'Noir Smart Speaker': { brand: 'Roomtone', collectionName: 'Home Signal', accent: '#ef4444', aiScore: 92, salesCount: 540, featured: false, recommendationTags: ['electronics', 'home', 'audio'] },
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    await Coupon.deleteMany({});
    console.log('🗑️  Cleared existing products');

    const productsWithSlugs = products.map(p => ({
      ...p,
      ...productMetadata[p.name],
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }));

    const created = await Product.insertMany(productsWithSlugs);
    console.log(`🌱 Seeded ${created.length} products`);

    await Coupon.create({
      code: 'MYTHIC10',
      type: 'percent',
      value: 10,
      minSubtotal: 50,
      maxDiscount: 50,
      active: true,
    });
    console.log('🎟️  Seeded MYTHIC10 coupon');

    await mongoose.disconnect();
    console.log('✅ Done — disconnected');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
