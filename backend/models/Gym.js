import mongoose from 'mongoose';

/** Multi-gym + optional white-label / subscription fields */
const gymSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#39ff14' },
    /** Optional SaaS tier for the gym tenant */
    subscriptionPlan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'enterprise'],
      default: 'starter',
    },
    subscriptionExpiresAt: { type: Date, default: null },
    /** Franchise / multi-branch rollup (optional) */
    parentGymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Gym', gymSchema);
