import Workout from '../models/Workout.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveGymId } from '../utils/gymScope.js';

export const listWorkouts = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const filter = { gymId };
  if (req.query.memberId) filter.memberId = req.query.memberId;
  const rows = await Workout.find(filter)
    .populate('trainerId')
    .sort({ updatedAt: -1 });
  res.json(rows);
});

export const createWorkout = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const w = await Workout.create({ ...req.body, gymId });
  res.status(201).json(w);
});

export const assignToMember = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  const copy = { ...req.body, gymId };
  delete copy.sourceWorkoutId;
  const w = await Workout.create(copy);
  res.status(201).json(w);
});

export const trackProgress = asyncHandler(async (req, res) => {
  const { entry } = req.body;
  const w = await Workout.findById(req.params.id);
  if (!w) return res.status(404).json({ message: 'Not found' });
  w.progressLog.push({
    date: new Date(),
    ...entry,
  });
  await w.save();
  res.json(w);
});
