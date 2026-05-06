import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: true,
    },
    capacity: { type: Number, default: 20, min: 1, max: 999 },
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

classSchema.index({ gymId: 1, trainer: 1 });
classSchema.index({ gymId: 1, createdAt: -1 });

export default mongoose.model('Class', classSchema);
