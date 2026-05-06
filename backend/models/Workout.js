import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 120 },
  muscleGroup: { type: String, trim: true, maxlength: 80 },
});

const workoutSchema = new mongoose.Schema(
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
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      default: null,
    },
    workoutPlan: { type: String, default: '' },
    exercises: [exerciseSchema],
    sets: { type: Number, default: 3, min: 0, max: 999 },
    reps: { type: Number, default: 10, min: 0, max: 9999 },
    notes: { type: String, default: '' },
    progressLog: [
      {
        date: Date,
        completedSets: Number,
        weightKg: Number,
        notes: String,
      },
    ],
  },
  { timestamps: true }
);

workoutSchema.index({ gymId: 1, memberId: 1, updatedAt: -1 });
workoutSchema.index({ gymId: 1, trainerId: 1 }, { sparse: true });

export default mongoose.model('Workout', workoutSchema);
