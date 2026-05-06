import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    type: {
      type: String,
      enum: ['info', 'payment', 'attendance', 'class', 'system'],
      default: 'info',
    },
    readStatus: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, readStatus: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
