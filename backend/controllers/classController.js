import Class from '../models/Class.js';
import Member from '../models/Member.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveGymId } from '../utils/gymScope.js';

export const listClasses = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const rows = await Class.find({ gymId })
    .populate('trainer')
    .populate('bookedMembers')
    .sort({ 'schedule.day': 1 });
  res.json(rows);
});

export const createClass = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const c = await Class.create({ ...req.body, gymId });
  res.status(201).json(c);
});

export const bookClass = asyncHandler(async (req, res) => {
  const { memberId } = req.body;
  const cls = await Class.findById(req.params.id);
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  if (cls.bookedMembers.length >= cls.capacity) {
    return res.status(400).json({ message: 'Class full' });
  }
  const member = await Member.findById(memberId);
  if (!member || String(member.gymId) !== String(cls.gymId)) {
    return res.status(400).json({ message: 'Invalid member' });
  }
  cls.bookedMembers.addToSet(memberId);
  await cls.save();
  res.json(cls);
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const { memberId } = req.body;
  const cls = await Class.findByIdAndUpdate(
    req.params.id,
    { $pull: { bookedMembers: memberId } },
    { new: true }
  )
    .populate('trainer')
    .populate('bookedMembers');
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  res.json(cls);
});
