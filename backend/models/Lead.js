import mongoose from 'mongoose';

const followUpEntrySchema = new mongoose.Schema(
  {
    content: { type: String, default: '', trim: true, maxlength: 4000 },
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 32 },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'unspecified'],
      default: 'unspecified',
    },
    /** Trainer proposed for this inquiry (optional) */
    assignedTrainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      default: null,
    },
    source: { type: String, default: 'walk-in' },
    /** When source is member referral: existing member who referred this inquiry */
    referralMemberName: { type: String, default: '', trim: true, maxlength: 120 },
    status: {
      type: String,
      enum: ['hot', 'warm', 'cold', 'converted'],
      default: 'hot',
    },
    notes: { type: String, default: '' },
    /** Staff member or desk name responsible for this inquiry */
    handledBy: { type: String, default: '', trim: true, maxlength: 120 },
    /** Staff-visible inquiry context (goals, budget, timing, etc.) */
    remarks: { type: String, default: '', trim: true, maxlength: 4000 },
    /** Trial visit / session booked for this prospect */
    trialBooked: { type: Boolean, default: false },
    /** Structured follow-up notes: 1st, 2nd, + optional extra slots */
    followUpEntries: { type: [followUpEntrySchema], default: [] },
    /** When staff should follow up next (inquiry pipeline) */
    nextFollowUpAt: { type: Date, default: null },
    lastFollowUpNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

leadSchema.index({ gymId: 1, nextFollowUpAt: 1 });
leadSchema.index({ gymId: 1, status: 1, createdAt: -1 });
leadSchema.index({ gymId: 1, createdAt: -1 });

export default mongoose.model('Lead', leadSchema);
