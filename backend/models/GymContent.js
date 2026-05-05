import mongoose from 'mongoose';

/** Lightweight gym CMS: announcements, policies, member-facing snippets */
const gymContentSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, default: '' },
    category: {
      type: String,
      enum: ['announcement', 'policy', 'workout', 'nutrition', 'general'],
      default: 'general',
    },
    pinned: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

gymContentSchema.index({ gymId: 1, pinned: -1, updatedAt: -1 });

export default mongoose.model('GymContent', gymContentSchema);
