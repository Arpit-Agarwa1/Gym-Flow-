import Trainer from '../models/Trainer.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveGymId } from '../utils/gymScope.js';

export const listTrainers = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const trainers = await Trainer.find({ gymId })
    .populate('assignedMembers')
    .sort({ name: 1 });
  res.json(trainers);
});

export const getTrainer = asyncHandler(async (req, res) => {
  const t = await Trainer.findById(req.params.id).populate('assignedMembers');
  if (!t) return res.status(404).json({ message: 'Not found' });
  res.json(t);
});

export const createTrainer = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const trainer = await Trainer.create({ ...req.body, gymId });
  res.status(201).json(trainer);
});

export const updateTrainer = asyncHandler(async (req, res) => {
  const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!trainer) return res.status(404).json({ message: 'Not found' });
  res.json(trainer);
});

export const assignMembers = asyncHandler(async (req, res) => {
  const { memberIds } = req.body;
  const trainer = await Trainer.findByIdAndUpdate(
    req.params.id,
    { assignedMembers: memberIds },
    { new: true }
  ).populate('assignedMembers');
  res.json(trainer);
});

export const trainerSchedule = asyncHandler(async (req, res) => {
  const trainer = await Trainer.findById(req.params.id);
  if (!trainer) return res.status(404).json({ message: 'Not found' });
  res.json(trainer.schedule || []);
});
