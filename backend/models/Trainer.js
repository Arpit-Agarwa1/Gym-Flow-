import mongoose from 'mongoose';

const trainerSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    /** Optional link to a User with role Trainer */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: { type: String, required: true, trim: true },
    expertise: [{ type: String }],
    certifications: [{ type: String }],
    assignedMembers: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    ],
    salary: { type: Number, default: 0, min: 0 },
    experienceYears: { type: Number, default: 0, min: 0, max: 80 },
    /** Simple weekly schedule slots */
    schedule: [
      {
        day: {
          type: String,
          enum: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
        },
        start: String,
        end: String,
      },
    ],
  },
  { timestamps: true }
);

trainerSchema.index({ gymId: 1, name: 1 });
trainerSchema.index({ gymId: 1, userId: 1 }, { sparse: true });

export default mongoose.model('Trainer', trainerSchema);
