import mongoose from 'mongoose';

const saleLineSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, trim: true, maxlength: 200 },
  qty: { type: Number, default: 1, min: 1, max: 99999 },
  unitPrice: { type: Number, default: 0, min: 0 },
});

const saleSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    lines: [saleLineSchema],
    total: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'other'],
      default: 'cash',
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      default: null,
    },
    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

saleSchema.index({ gymId: 1, createdAt: -1 });
saleSchema.index({ gymId: 1, memberId: 1, createdAt: -1 }, { sparse: true });

export default mongoose.model('Sale', saleSchema);
