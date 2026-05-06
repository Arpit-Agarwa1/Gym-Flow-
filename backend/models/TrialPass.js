import mongoose from 'mongoose';

/** Trial or drop-in access window */
const trialPassSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    type: {
      type: String,
      enum: ['trial', 'dropin'],
      default: 'trial',
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      default: null,
    },
    visitorName: { type: String, default: '' },
    visitorPhone: { type: String, default: '' },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    notes: { type: String, default: '' },
    usedCheckIns: { type: Number, default: 0, min: 0 },
    maxCheckIns: { type: Number, default: 999, min: 1, max: 999999 },
  },
  { timestamps: true }
);

trialPassSchema.index({ gymId: 1, validTo: 1 });
trialPassSchema.index({ gymId: 1, memberId: 1 }, { sparse: true });

export default mongoose.model('TrialPass', trialPassSchema);
