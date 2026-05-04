import Payment from '../models/Payment.js';
import Attendance from '../models/Attendance.js';
import Member from '../models/Member.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveGymId } from '../utils/gymScope.js';
import { toCsvRow } from '../utils/csv.js';
import { getDashboardStats } from '../services/dashboardService.js';

export const revenueReport = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const rows = await Payment.find({ gymId, status: 'completed' }).sort({
    date: -1,
  });
  if (req.query.format === 'csv') {
    const header = toCsvRow([
      'invoiceNumber',
      'memberId',
      'amount',
      'method',
      'date',
    ]);
    const lines = rows.map((p) =>
      toCsvRow([
        p.invoiceNumber,
        p.memberId,
        p.amount,
        p.paymentMethod,
        p.date?.toISOString(),
      ])
    );
    res.setHeader('Content-Type', 'text/csv');
    res.send([header, ...lines].join('\n'));
    return;
  }
  res.json(rows);
});

export const attendanceReport = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const rows = await Attendance.find({ gymId })
    .populate({ path: 'memberId', populate: { path: 'userId' } })
    .sort({ checkInTime: -1 })
    .limit(1000);
  if (req.query.format === 'csv') {
    const header = toCsvRow(['member', 'checkIn', 'checkOut', 'minutes']);
    const lines = rows.map((a) =>
      toCsvRow([
        a.memberId?.userId?.name,
        a.checkInTime?.toISOString(),
        a.checkOutTime?.toISOString(),
        a.duration,
      ])
    );
    res.setHeader('Content-Type', 'text/csv');
    res.send([header, ...lines].join('\n'));
    return;
  }
  res.json(rows);
});

export const membershipReport = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const rows = await Member.find({ gymId })
    .populate('userId')
    .populate('membershipPlan');
  if (req.query.format === 'csv') {
    const header = toCsvRow([
      'name',
      'email',
      'plan',
      'joining',
      'expiry',
      'frozen',
    ]);
    const lines = rows.map((m) =>
      toCsvRow([
        m.userId?.name,
        m.userId?.email,
        m.membershipPlan?.name,
        m.joiningDate?.toISOString(),
        m.expiryDate?.toISOString(),
        m.frozen,
      ])
    );
    res.setHeader('Content-Type', 'text/csv');
    res.send([header, ...lines].join('\n'));
    return;
  }
  res.json(rows);
});

export const analyticsDashboard = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const stats = await getDashboardStats(gymId);
  res.json(stats);
});
