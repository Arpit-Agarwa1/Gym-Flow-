import User from '../models/User.js';
import {
  registerUser,
  loginUser,
  createResetToken,
  setResetToken,
  resetPasswordWithToken,
} from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, gymId } = req.body;
  const { user, token } = await registerUser({
    name,
    email,
    password,
    role,
    phone,
    gymId,
  });
  const safe = user.toObject();
  delete safe.password;
  res.status(201).json({ user: safe, token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await loginUser(email, password);
  res.json({ user, token });
});

export const logout = asyncHandler(async (_req, res) => {
  // JWT is stateless — client drops token; endpoint exists for symmetry / analytics hooks
  res.json({ message: 'Logged out' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({
      message: 'If that email exists, a reset link was sent.',
    });
  }
  const { raw, hash } = createResetToken();
  await setResetToken(user._id, hash, Date.now() + 60 * 60 * 1000);
  // Beginner-friendly: return token in dev so email server is not required
  const payload = {
    message: 'If that email exists, a reset link was sent.',
  };
  if (process.env.NODE_ENV !== 'production') {
    payload.devResetToken = raw;
  }
  res.json(payload);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await resetPasswordWithToken(token, password);
  res.json({ message: 'Password updated' });
});

export const me = asyncHandler(async (req, res) => {
  const u = req.user.toObject();
  delete u.password;
  res.json(u);
});
