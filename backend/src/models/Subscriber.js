import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    active: { type: Boolean, default: true, index: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

subscriberSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('Subscriber', subscriberSchema);
