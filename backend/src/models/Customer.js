import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({ name: String, line1: String, line2: String, city: String, state: String, zip: String, country: String }, { _id: false });
const customerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, source: { type: String, enum: ['local', 'shopify'], default: 'local', index: true }, shopifyCustomerId: { type: String, trim: true },
  name: { type: String, required: true, trim: true, maxlength: 120 }, email: { type: String, default: null, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ }, phone: { type: String, trim: true, default: null, maxlength: 32 }, addresses: { type: [addressSchema], default: [] }, status: { type: String, enum: ['active', 'disabled', 'guest', 'unknown'], default: 'active', index: true }, orderCount: { type: Number, default: 0, min: 0 }, totalSpent: { type: Number, default: 0, min: 0 }, currency: { type: String, uppercase: true, default: 'USD' }, lastOrderAt: { type: Date, default: null }, lastActivityAt: { type: Date, default: null },
}, { timestamps: true });
customerSchema.index({ shopifyCustomerId: 1 }, { unique: true, partialFilterExpression: { shopifyCustomerId: { $type: 'string' } } });
customerSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });
customerSchema.index({ name: 'text', email: 'text', phone: 'text' });
customerSchema.index({ status: 1, createdAt: -1 });
customerSchema.index({ orderCount: -1, totalSpent: -1 });
export default mongoose.model('Customer', customerSchema);
