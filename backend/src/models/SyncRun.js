import mongoose from 'mongoose';

const syncRunSchema = new mongoose.Schema({
  source: { type: String, enum: ['shopify', 'shopify_orders', 'shopify_customers'], required: true, index: true },
  status: { type: String, enum: ['running', 'completed', 'failed'], required: true },
  startedAt: { type: Date, required: true },
  completedAt: Date,
  fetched: { type: Number, default: 0 },
  upserted: { type: Number, default: 0 },
  deactivated: { type: Number, default: 0 },
  error: String,
}, { timestamps: true });

syncRunSchema.index({ source: 1, createdAt: -1 });
export default mongoose.model('SyncRun', syncRunSchema);
