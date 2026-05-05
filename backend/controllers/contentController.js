import GymContent from '../models/GymContent.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveGymId } from '../utils/gymScope.js';

export const listContents = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const q = { gymId };
  if (req.query.published === 'true') q.published = true;
  const rows = await GymContent.find(q).sort({ pinned: -1, updatedAt: -1 });
  res.json(rows);
});

export const createContent = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const row = await GymContent.create({ ...req.body, gymId });
  res.status(201).json(row);
});

export const updateContent = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const row = await GymContent.findOneAndUpdate(
    { _id: req.params.id, gymId },
    req.body,
    { new: true }
  );
  if (!row) return res.status(404).json({ message: 'Not found' });
  res.json(row);
});

export const deleteContent = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const row = await GymContent.findOneAndDelete({
    _id: req.params.id,
    gymId,
  });
  if (!row) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
});
