import mongoose from 'mongoose';

/** Recurring membership billing record (gateway IDs optional) */
const subscriptionSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    membershipPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled', 'past_due'],
      default: 'active',
    },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    razorpaySubscriptionId: { type: String, default: '' },
    stripeSubscriptionId: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

subscriptionSchema.index({ memberId: 1 });
subscriptionSchema.index({ gymId: 1, status: 1 });
subscriptionSchema.index({ gymId: 1, memberId: 1 });

export default mongoose.model('Subscription', subscriptionSchema);
