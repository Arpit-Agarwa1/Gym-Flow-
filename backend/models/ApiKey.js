import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    name: { type: String, required: true },
    keyPrefix: { type: String, required: true },
    keyHash: { type: String, required: true },
    lastUsedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('ApiKey', apiKeySchema);
