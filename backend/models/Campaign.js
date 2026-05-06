import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    channel: {
      type: String,
      enum: ['email', 'sms', 'whatsapp'],
      default: 'email',
    },
    segment: {
      type: String,
      enum: [
        'all_members',
        'expiring_7d',
        'expiring_30d',
        'dormant_30d',
        'all_leads',
      ],
      default: 'all_members',
    },
    subject: { type: String, default: '' },
    body: { type: String, required: true, maxlength: 500000 },
    scheduledAt: { type: Date },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
      default: 'draft',
    },
    sentCount: { type: Number, default: 0, min: 0 },
    errorMessage: { type: String, default: '' },
  },
  { timestamps: true }
);

campaignSchema.index({ gymId: 1, status: 1, scheduledAt: 1 });
campaignSchema.index({ gymId: 1, createdAt: -1 });

export default mongoose.model('Campaign', campaignSchema);
