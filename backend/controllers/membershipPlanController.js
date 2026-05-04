import MembershipPlan from '../models/MembershipPlan.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveGymId } from '../utils/gymScope.js';

export const listPlans = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const plans = await MembershipPlan.find({ gymId }).sort({ price: 1 });
  res.json(plans);
});

export const createPlan = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const plan = await MembershipPlan.create({ ...req.body, gymId });
  res.status(201).json(plan);
});

export const updatePlan = asyncHandler(async (req, res) => {
  const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!plan) return res.status(404).json({ message: 'Plan not found' });
  res.json(plan);
});

export const deletePlan = asyncHandler(async (req, res) => {
  await MembershipPlan.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});
