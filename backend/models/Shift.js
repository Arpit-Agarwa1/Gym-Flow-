import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    staffUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roleLabel: { type: String, default: 'Staff' },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    notes: { type: String, default: '' },
    /** Payroll export helpers */
    hourlyRateSnapshot: { type: Number, default: null },
    commissionNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

shiftSchema.index({ gymId: 1, start: 1 });

export default mongoose.model('Shift', shiftSchema);
