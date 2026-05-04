import DietPlan from '../models/DietPlan.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveGymId } from '../utils/gymScope.js';

export const listDiets = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const filter = { gymId };
  if (req.query.memberId) filter.memberId = req.query.memberId;
  const rows = await DietPlan.find(filter).sort({ updatedAt: -1 });
  res.json(rows);
});

export const createDiet = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const d = await DietPlan.create({ ...req.body, gymId });
  res.status(201).json(d);
});

export const assignDiet = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  const d = await DietPlan.create({ ...req.body, gymId });
  res.status(201).json(d);
});
