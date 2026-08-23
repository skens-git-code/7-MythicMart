/* User model — bcrypt hashing, JWT support, indexed by email */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, /* Never returned in queries by default */
    },
    role: {
      type: String,
      enum: ['user', 'support', 'manager', 'admin'],
      default: 'user',
    },
    permissions: {
      type: [String],
      default: [],
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [24, 'Phone cannot exceed 24 characters'],
      default: null,
    },
    loyaltyTier: {
      type: String,
      enum: ['standard', 'gold', 'platinum'],
      default: 'standard',
    },
    preferences: {
      theme: { type: String, enum: ['system', 'light', 'dark'], default: 'system' },
      currency: { type: String, default: 'USD', maxlength: 8 },
      notifications: {
        orderUpdates: { type: Boolean, default: true },
        priceDrops: { type: Boolean, default: true },
        security: { type: Boolean, default: true },
        promotions: { type: Boolean, default: false },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.index({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ loyaltyTier: 1, createdAt: -1 });
userSchema.index({ createdAt: -1 });

/* Hash password before saving */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date();
});

/* Compare plain password against stored hash */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toAuthJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    permissions: this.permissions,
    avatar: this.avatar,
    loyaltyTier: this.loyaltyTier,
    emailVerified: this.emailVerified,
  };
};

const User = mongoose.model('User', userSchema);
export default User;
