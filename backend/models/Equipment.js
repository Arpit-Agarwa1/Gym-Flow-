import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    purchaseDate: { type: Date },
    warranty: { type: String, default: '' },
    maintenanceDate: { type: Date },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'needs_service', 'retired'],
      default: 'good',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

equipmentSchema.index({ gymId: 1, condition: 1 });
equipmentSchema.index({ gymId: 1, name: 1 });

export default mongoose.model('Equipment', equipmentSchema);
