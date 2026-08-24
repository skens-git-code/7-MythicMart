/* Product model — indexed for search, category filter, and slug lookup */
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    sku: {
      type: String,
      uppercase: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [80, 'Brand cannot exceed 80 characters'],
      default: 'MythicMart',
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      default: null,
      min: [0, 'Original price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['accessories', 'bags', 'electronics', 'clothing', 'footwear', 'other'],
      lowercase: true,
    },
    image: {
      type: String,
      default: null,
    },
    badge: {
      type: String,
      enum: ['Best Seller', 'New', 'Trending', 'Sale', null],
      default: null,
    },
    collectionName: {
      type: String,
      trim: true,
      maxlength: [80, 'Collection cannot exceed 80 characters'],
      default: 'Premium Edit',
    },
    accent: {
      type: String,
      trim: true,
      match: [/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Accent must be a valid hex color'],
      default: '#2f6fed',
    },
    aiScore: {
      type: Number,
      default: 90,
      min: 0,
      max: 100,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    reservedStock: {
      type: Number,
      min: [0, 'Reserved stock cannot be negative'],
      default: 0,
    },
    reorderPoint: {
      type: Number,
      min: [0, 'Reorder point cannot be negative'],
      default: 5,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    recommendationTags: {
      type: [String],
      default: [],
      index: true,
    },
    salesCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    viewCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    source: { type: String, enum: ['local', 'shopify'], default: 'local', index: true },
    shopifyProductId: { type: String, trim: true },
    shopifyHandle: { type: String, trim: true },
    shopifyStatus: { type: String, trim: true, uppercase: true },
    productType: { type: String, trim: true },
    shopifyTags: { type: [String], default: [] },
    shopifyProductUpdatedAt: { type: Date },
    shopifyProductCreatedAt: { type: Date },
    images: [{ url: { type: String, required: true }, altText: String }],
    variants: [{
      shopifyVariantId: { type: String, required: true },
      title: String, sku: String, price: { type: Number, min: 0 },
      compareAtPrice: { type: Number, min: 0, default: null },
      inventoryQuantity: { type: Number, default: 0 }, availableForSale: Boolean,
      selectedOptions: [{ name: String, value: String }], image: String,
    }],
    options: [{ name: String, values: [String] }],
    shopifyVariantIds: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

/* ── Indexes ── */
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ sku: 1 }, { unique: true, sparse: true });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' }, { weights: { name: 10, description: 5 } });
productSchema.index({ category: 1, price: 1, isActive: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ isActive: 1, rating: -1 });
productSchema.index({ badge: 1, isActive: 1 });
productSchema.index({ isActive: 1, aiScore: -1, rating: -1 });
productSchema.index({ isActive: 1, featured: -1, salesCount: -1 });
productSchema.index({ category: 1, isActive: 1, aiScore: -1 });
productSchema.index({ stock: 1, reorderPoint: 1, isActive: 1 });
productSchema.index({ shopifyProductId: 1 }, { unique: true, sparse: true });
productSchema.index({ source: 1, shopifyStatus: 1, isActive: 1 });
productSchema.index({ shopifyHandle: 1 }, { sparse: true });

/* Auto-generate slug from name before saving */
productSchema.pre('save', function () {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;
