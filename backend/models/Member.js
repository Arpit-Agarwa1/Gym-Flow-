import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    membershipPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      default: null,
    },
    joiningDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, default: null },
    emergencyContact: {
      name: String,
      phone: String,
    },
    height: { type: Number, min: 0, max: 300 }, // cm
    weight: { type: Number, min: 0, max: 500 }, // kg
    bmi: { type: Number },
    injuries: { type: String, default: '' },
    notes: { type: String, default: '' },
    frozen: { type: Boolean, default: false },
    assignedTrainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      default: null,
    },
    /** Referral program */
    referralCode: { type: String, trim: true, sparse: true, unique: true },
    referredByMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      default: null,
    },
    /** Renewal comms tracking */
    lastRenewalReminderAt: { type: Date, default: null },
    /** Grace after expiry before auto-freeze (optional, days) */
    gracePeriodDays: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/** Renewals, roster by gym */
memberSchema.index({ gymId: 1, expiryDate: 1 });
memberSchema.index({ gymId: 1, joiningDate: -1 });

memberSchema.pre('save', function computeBmi(next) {
  if (this.height && this.weight && this.height > 0) {
    const hM = this.height / 100;
    this.bmi = Math.round((this.weight / (hM * hM)) * 10) / 10;
  }
  next();
});

export default mongoose.model('Member', memberSchema);
