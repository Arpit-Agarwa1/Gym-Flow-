import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    /** Snapshot of linked member's display name at payment time (raw DB / CSV). */
    memberName: { type: String, trim: true, default: '' },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'razorpay', 'other'],
      default: 'cash',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed',
    },
    invoiceNumber: { type: String, unique: true, sparse: true },
    transactionId: { type: String, default: '' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

paymentSchema.index({ gymId: 1, date: -1 });
paymentSchema.index({ gymId: 1, memberId: 1, date: -1 });
paymentSchema.index({ gymId: 1, status: 1, date: -1 });

export default mongoose.model('Payment', paymentSchema);
