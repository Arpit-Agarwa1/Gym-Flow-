import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: String,
  muscleGroup: String,
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
    sets: { type: Number, default: 3 },
    reps: { type: Number, default: 10 },
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

export default mongoose.model('Workout', workoutSchema);
