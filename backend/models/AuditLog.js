import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: '' },
  },
  { timestamps: true }
);

auditLogSchema.index({ gymId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
