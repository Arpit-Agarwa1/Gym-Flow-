import mongoose from 'mongoose';

const membershipPlanSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    duration: { type: Number, required: true, min: 1, max: 120 }, // months
    price: { type: Number, required: true, min: 0 },
    joiningFee: { type: Number, default: 0, min: 0 },
    accessTime: { type: String, default: 'All day' },
    personalTrainerIncluded: { type: Boolean, default: false },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

membershipPlanSchema.index({ gymId: 1, name: 1 });

export default mongoose.model('MembershipPlan', membershipPlanSchema);
