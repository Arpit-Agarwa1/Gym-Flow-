import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    sku: { type: String, trim: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    stockQty: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
