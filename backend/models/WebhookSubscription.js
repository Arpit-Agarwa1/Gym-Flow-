import mongoose from 'mongoose';

const webhookSubscriptionSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    url: { type: String, required: true },
    secret: { type: String, required: true },
    events: [{ type: String }],
    active: { type: Boolean, default: true },
    lastTriggeredAt: { type: Date },
    failureCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('WebhookSubscription', webhookSubscriptionSchema);
