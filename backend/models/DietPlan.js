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
    calories: { type: Number, default: 2000 },
    macros: {
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fats: { type: Number, default: 0 },
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

export default mongoose.model('DietPlan', dietPlanSchema);
