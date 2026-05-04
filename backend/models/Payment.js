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
    amount: { type: Number, required: true },
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

export default mongoose.model('Payment', paymentSchema);
