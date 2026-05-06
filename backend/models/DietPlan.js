import mongoose from 'mongoose';

const dietPlanSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    calories: { type: Number, default: 2000, min: 0, max: 50000 },
    macros: {
      protein: { type: Number, default: 0, min: 0 },
      carbs: { type: Number, default: 0, min: 0 },
      fats: { type: Number, default: 0, min: 0 },
    },
    weeklyPlan: [
      {
        day: String,
        meals: [String],
      },
    ],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

dietPlanSchema.index({ gymId: 1, memberId: 1, updatedAt: -1 });

export default mongoose.model('DietPlan', dietPlanSchema);
