import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ['order', 'wishlist', 'security', 'support', 'promotion'],
      default: 'order',
    },
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    readAt: {
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

notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ user: 1, readAt: 1, priority: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
