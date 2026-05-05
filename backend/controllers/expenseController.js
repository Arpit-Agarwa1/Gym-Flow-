import Expense from '../models/Expense.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveGymId } from '../utils/gymScope.js';

export const listExpenses = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const rows = await Expense.find({ gymId })
    .populate('recordedByUserId', 'name email')
    .sort({ incurredAt: -1 })
    .limit(500);
  res.json(rows);
});

export const createExpense = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const row = await Expense.create({
    ...req.body,
    gymId,
    recordedByUserId: req.user?._id ?? null,
  });
  res.status(201).json(row);
});

export const updateExpense = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const row = await Expense.findOneAndUpdate(
    { _id: req.params.id, gymId },
    req.body,
    { new: true }
  );
  if (!row) return res.status(404).json({ message: 'Not found' });
  res.json(row);
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const row = await Expense.findOneAndDelete({
    _id: req.params.id,
    gymId,
  });
  if (!row) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
});
