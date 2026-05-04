import crypto from 'crypto';
import User, { ROLES } from '../models/User.js';
import Member from '../models/Member.js';
import { signToken } from '../utils/jwt.js';

export async function registerUser({
  name,
  email,
  password,
  role,
  phone,
  gymId,
}) {
  const exists = await User.findOne({ email });
  if (exists) {
    const err = new Error('Email already registered');
    err.statusCode = 400;
    throw err;
  }
  const safeRole = role && Object.values(ROLES).includes(role) ? role : ROLES.MEMBER;
  const user = await User.create({
    name,
    email,
    password,
    role: safeRole,
    phone,
    gymId: gymId || null,
  });
  if (safeRole === ROLES.MEMBER && gymId) {
    await Member.create({
      userId: user._id,
      gymId,
      joiningDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  }
  const token = signToken({ id: user._id.toString(), role: user.role });
  return { user, token };
}

export async function loginUser(email, password) {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }
  const ok = await user.comparePassword(password);
  if (!ok) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }
  const token = signToken({ id: user._id.toString(), role: user.role });
  const out = user.toObject();
  delete out.password;
  return { user: out, token };
}

export function createResetToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

export async function setResetToken(userId, hash, expireAt) {
  await User.findByIdAndUpdate(userId, {
    resetPasswordToken: hash,
    resetPasswordExpire: expireAt,
  });
}

export async function resetPasswordWithToken(rawToken, newPassword) {
  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hash,
    resetPasswordExpire: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpire');
  if (!user) {
    const err = new Error('Invalid or expired token');
    err.statusCode = 400;
    throw err;
  }
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  return true;
}
