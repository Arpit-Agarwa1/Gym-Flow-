import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/** SaaS / gym RBAC roles */
export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  GYM_OWNER: 'GymOwner',
  MANAGER: 'Manager',
  TRAINER: 'Trainer',
  STAFF: 'Staff',
  MEMBER: 'Member',
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.MEMBER,
    },
    phone: { type: String, trim: true },
    profilePhoto: { type: String, default: '' },
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      default: null,
    },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
    /** Short-lived token embedded in QR for member check-in */
    qrCheckInSecret: { type: String, select: false },
    qrCheckInExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
