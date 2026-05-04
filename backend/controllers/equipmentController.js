import Equipment from '../models/Equipment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveGymId } from '../utils/gymScope.js';

export const listEquipment = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const rows = await Equipment.find({ gymId }).sort({ name: 1 });
  res.json(rows);
});

export const addEquipment = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const row = await Equipment.create({ ...req.body, gymId });
  res.status(201).json(row);
});

export const updateEquipment = asyncHandler(async (req, res) => {
  const row = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!row) return res.status(404).json({ message: 'Not found' });
  res.json(row);
});
