import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    sku: { type: String, trim: true, maxlength: 64 },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    price: { type: Number, required: true, default: 0, min: 0 },
    stockQty: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/** Empty SKU must not block sparse unique index (multiple products without SKU per gym). */
productSchema.pre('validate', function normalizeSku() {
  if (this.sku != null && String(this.sku).trim() === '') {
    this.set('sku', undefined);
  }
});

productSchema.index({ gymId: 1, active: 1, name: 1 });
/** One SKU per gym when sku is set */
productSchema.index({ gymId: 1, sku: 1 }, { unique: true, sparse: true });

export default mongoose.model('Product', productSchema);
