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
    expiryDate: { type: Date },
    emergencyContact: {
      name: String,
      phone: String,
    },
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
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

memberSchema.pre('save', function computeBmi(next) {
  if (this.height && this.weight && this.height > 0) {
    const hM = this.height / 100;
    this.bmi = Math.round((this.weight / (hM * hM)) * 10) / 10;
  }
  next();
});

export default mongoose.model('Member', memberSchema);
