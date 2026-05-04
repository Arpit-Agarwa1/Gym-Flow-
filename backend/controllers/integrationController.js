import Member from '../models/Member.js';
import Lead from '../models/Lead.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Search scoped to gym from API key */
export const integrationSearch = asyncHandler(async (req, res) => {
  const gymId = req.integrationGymId;
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json({ members: [], leads: [], payments: [] });
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const users = await User.find({
    $or: [{ name: rx }, { email: rx }, { phone: rx }],
  }).select('_id');
  const userIds = users.map((u) => u._id);
  const members = await Member.find({ gymId, userId: { $in: userIds } })
    .populate('userId', 'name email phone')
    .limit(15);
  const leads = await Lead.find({
    gymId,
    $or: [{ name: rx }, { phone: rx }],
  }).limit(15);
  const payments = await Payment.find({ gymId, invoiceNumber: rx })
    .populate({ path: 'memberId', populate: { path: 'userId' } })
    .limit(10);
  res.json({ members, leads, payments });
});
