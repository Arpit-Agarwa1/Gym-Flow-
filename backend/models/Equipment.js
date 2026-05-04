import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    name: { type: String, required: true },
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

export default mongoose.model('Equipment', equipmentSchema);
