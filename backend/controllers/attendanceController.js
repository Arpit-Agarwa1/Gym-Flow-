import jwt from 'jsonwebtoken';
import Attendance from '../models/Attendance.js';
import Member from '../models/Member.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveGymId } from '../utils/gymScope.js';
import { createCheckInToken, qrDataUrlFromToken } from '../services/qrService.js';

export const manualCheckIn = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const { memberId } = req.body;
  const member = await Member.findOne({ _id: memberId, gymId });
  if (!member) return res.status(404).json({ message: 'Member not found' });
  if (member.frozen) return res.status(400).json({ message: 'Membership frozen' });

  const open = await Attendance.findOne({
    memberId,
    checkOutTime: null,
  }).sort({ checkInTime: -1 });
  if (open) {
    open.checkOutTime = new Date();
    open.duration = Math.round(
      (open.checkOutTime - open.checkInTime) / 60000
    );
    await open.save();
    return res.json({ mode: 'checkout', attendance: open });
  }

  const doc = await Attendance.create({
    gymId,
    memberId,
    checkInTime: new Date(),
    source: 'manual',
  });
  res.status(201).json({ mode: 'checkin', attendance: doc });
});

export const qrCheckIn = asyncHandler(async (req, res) => {
  const { token } = req.body;
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(400).json({ message: 'Invalid QR' });
  }
  if (payload.typ !== 'checkin')
    return res.status(400).json({ message: 'Invalid QR type' });

  const member = await Member.findById(payload.mid);
  if (!member || String(member.gymId) !== String(payload.gid)) {
    return res.status(400).json({ message: 'Member mismatch' });
  }
  if (member.frozen) return res.status(400).json({ message: 'Membership frozen' });

  const open = await Attendance.findOne({
    memberId: member._id,
    checkOutTime: null,
  }).sort({ checkInTime: -1 });
  if (open) {
    open.checkOutTime = new Date();
    open.duration = Math.round(
      (open.checkOutTime - open.checkInTime) / 60000
    );
    await open.save();
    return res.json({ mode: 'checkout', attendance: open });
  }

  const doc = await Attendance.create({
    gymId: member.gymId,
    memberId: member._id,
    checkInTime: new Date(),
    source: 'qr',
  });
  res.status(201).json({ mode: 'checkin', attendance: doc });
});

export const attendanceHistory = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const filter = { gymId };
  if (req.query.memberId) filter.memberId = req.query.memberId;
  const rows = await Attendance.find(filter)
    .populate({ path: 'memberId', populate: { path: 'userId' } })
    .sort({ checkInTime: -1 })
    .limit(500);
  res.json(rows);
});

/** Staff generates QR for a member */
export const memberQrPayload = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const member = await Member.findOne({
    _id: req.params.memberId,
    gymId,
  });
  if (!member) return res.status(404).json({ message: 'Member not found' });
  const token = createCheckInToken(member._id, member.gymId);
  const dataUrl = await qrDataUrlFromToken(token);
  res.json({ token, qrDataUrl: dataUrl });
});
