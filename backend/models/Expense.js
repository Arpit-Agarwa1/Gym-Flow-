import mongoose from 'mongoose';

/** Gym operating expense line item */
const expenseSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: [
        'rent',
        'utilities',
        'equipment',
        'marketing',
        'payroll',
        'supplies',
        'other',
      ],
      default: 'other',
    },
    note: { type: String, default: '' },
    incurredAt: { type: Date, default: Date.now },
    recordedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

expenseSchema.index({ gymId: 1, incurredAt: -1 });

export default mongoose.model('Expense', expenseSchema);
