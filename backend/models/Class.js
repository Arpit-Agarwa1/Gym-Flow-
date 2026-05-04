import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    name: { type: String, required: true },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: true,
    },
    capacity: { type: Number, default: 20 },
    schedule: {
      day: String,
      startTime: String,
      endTime: String,
    },
    bookedMembers: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Class', classSchema);
