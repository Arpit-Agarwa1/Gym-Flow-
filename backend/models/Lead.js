import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    source: { type: String, default: 'walk-in' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'trial', 'won', 'lost'],
      default: 'new',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Lead', leadSchema);
