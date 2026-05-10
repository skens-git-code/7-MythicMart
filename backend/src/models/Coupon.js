import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 32,
    },
    type: {
      type: String,
      enum: ['percent', 'fixed'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minSubtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: 0,
    },
    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
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

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ active: 1, expiresAt: 1 });

couponSchema.methods.calculateDiscount = function (subtotal) {
  const rawDiscount = this.type === 'percent' ? subtotal * (this.value / 100) : this.value;
  const cappedDiscount = this.maxDiscount ? Math.min(rawDiscount, this.maxDiscount) : rawDiscount;
  return Number(Math.min(cappedDiscount, subtotal).toFixed(2));
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
