/* Order model — indexed for user history and admin status queries */
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null, /* null for guest orders with no DB product */
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
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
    guestEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
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

/* ── Indexes ── */
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index({ guestEmail: 1, createdAt: -1 }, { sparse: true });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
