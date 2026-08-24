/* Order model — indexed for user history and admin status queries */
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null, /* null for guest orders with no DB product */
    },
    shopifyProductId: { type: String, trim: true, default: null },
    shopifyVariantId: { type: String, trim: true, default: null },
    sku: { type: String, trim: true, default: null },
    name: { type: String, required: true },
    image: { type: String, default: null },
    price: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, /* null = guest order */
    },
    source: { type: String, enum: ['local', 'shopify'], default: 'local', index: true },
    guestEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    orderNumber: {
      type: String,
      trim: true,
    },
    shopifyOrderId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    currency: { type: String, trim: true, uppercase: true, default: 'USD' },
    customer: {
      shopifyCustomerId: { type: String, trim: true, default: null },
      name: { type: String, trim: true, default: null },
      email: { type: String, trim: true, lowercase: true, default: null },
      phone: { type: String, trim: true, default: null },
    },
    fulfillmentStatus: {
      type: String,
      enum: ['unfulfilled', 'partially_fulfilled', 'fulfilled', 'cancelled'],
      default: 'unfulfilled',
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingLines: [{ title: String, price: { type: Number, min: 0 }, code: String }],
    items: {
      type: [orderItemSchema],
      validate: [arr => arr.length > 0, 'Order must have at least one item'],
    },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'authorized', 'paid', 'refunded', 'failed'],
      default: 'authorized',
    },
    tracking: {
      carrier: { type: String, trim: true, maxlength: 80, default: null },
      trackingNumber: { type: String, trim: true, maxlength: 120, default: null },
      estimatedDeliveryAt: { type: Date, default: null },
    },
    timeline: [
      {
        status: { type: String, trim: true, maxlength: 80 },
        message: { type: String, trim: true, maxlength: 240 },
        at: { type: Date, default: Date.now },
      },
    ],
    shippingAddress: {
      name: { type: String, trim: true, maxlength: 80 },
      line1: { type: String, trim: true, maxlength: 120 },
      city: { type: String, trim: true, maxlength: 80 },
      state: { type: String, trim: true, maxlength: 80 },
      zip: { type: String, trim: true, maxlength: 20 },
      country: { type: String, default: 'US' },
    },
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

/* Auto-generate human-friendly orderNumber if not provided */
orderSchema.pre('save', function () {
  if (!this.orderNumber) {
    this.orderNumber = `MM-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
});

/* ── Indexes ── */
orderSchema.index({ orderNumber: 1 }, { unique: true, sparse: true });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index({ fulfillmentStatus: 1, createdAt: -1 });
orderSchema.index({ 'customer.email': 1, createdAt: -1 }, { sparse: true });
orderSchema.index({ guestEmail: 1, createdAt: -1 }, { sparse: true });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
