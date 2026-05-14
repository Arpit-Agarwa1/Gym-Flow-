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
    /**
     * membership — fees / renewal
     * advance_hold — booking deposit (e.g. hold name / slot)
     * personal_training — PT billed separately; use trainerId
     */
    category: {
      type: String,
      enum: ['membership', 'advance_hold', 'personal_training', 'other'],
      default: 'membership',
    },
    /** PT allocation — required when category is personal_training */
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      default: null,
    },
    trainerName: { type: String, trim: true, default: '' },
    /** Pending dues: overdue when dueDate is before today and status is pending */
    dueDate: { type: Date, default: null },
    notes: { type: String, trim: true, default: '', maxlength: 2000 },
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
paymentSchema.index({ gymId: 1, category: 1, date: -1 });
paymentSchema.index({ gymId: 1, trainerId: 1, date: -1 }, { sparse: true });
paymentSchema.index({ gymId: 1, status: 1, dueDate: 1 });

export default mongoose.model('Payment', paymentSchema);
