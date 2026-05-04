import mongoose from 'mongoose';

const membershipPlanSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    duration: { type: Number, required: true }, // months
    price: { type: Number, required: true },
    joiningFee: { type: Number, default: 0 },
    accessTime: { type: String, default: 'All day' },
    personalTrainerIncluded: { type: Boolean, default: false },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('MembershipPlan', membershipPlanSchema);
