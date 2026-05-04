import Gym from '../models/Gym.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listGyms = asyncHandler(async (_req, res) => {
  const gyms = await Gym.find().sort({ name: 1 });
  res.json(gyms);
});

export const createGym = asyncHandler(async (req, res) => {
  const gym = await Gym.create(req.body);
  res.status(201).json(gym);
});

export const updateGym = asyncHandler(async (req, res) => {
  const gym = await Gym.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!gym) return res.status(404).json({ message: 'Gym not found' });
  res.json(gym);
});

/** Attach staff user to gym (owner/manager) */
export const assignStaff = asyncHandler(async (req, res) => {
  const { userId, gymId } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.gymId = gymId;
  await user.save();
  res.json(user);
});
