import Member from '../models/Member.js';
import Payment from '../models/Payment.js';
import Attendance from '../models/Attendance.js';

/**
 * Aggregates numbers for admin dashboard widgets + chart raw series.
 */
export async function getDashboardStats(gymId) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const memberFilter = { gymId };
  const totalMembers = await Member.countDocuments(memberFilter);
  const activeMembers = await Member.countDocuments({
    ...memberFilter,
    frozen: false,
    expiryDate: { $gte: now },
  });
  const expiredMembers = await Member.countDocuments({
    ...memberFilter,
    expiryDate: { $lt: now },
  });
  const newMembersThisWeek = await Member.countDocuments({
    ...memberFilter,
    createdAt: { $gte: weekAgo },
  });

  const payFilter = { gymId, status: 'completed' };
  const todayPayments = await Payment.find({
    ...payFilter,
    date: { $gte: startOfDay },
  });
  const monthPayments = await Payment.find({
    ...payFilter,
    date: { $gte: startOfMonth },
  });
  const revenueToday = todayPayments.reduce((s, p) => s + p.amount, 0);
  const revenueMonth = monthPayments.reduce((s, p) => s + p.amount, 0);

  // Last 6 months revenue buckets
  const revenueByMonth = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const sum = await Payment.aggregate([
      {
        $match: {
          gymId,
          status: 'completed',
          date: { $gte: d, $lt: next },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    revenueByMonth.push({
      label: d.toLocaleString('default', { month: 'short' }),
      value: sum[0]?.total || 0,
    });
  }

  const membershipGrowth = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const c = await Member.countDocuments({
      gymId,
      createdAt: { $lt: next },
    });
    membershipGrowth.push({
      label: d.toLocaleString('default', { month: 'short' }),
      value: c,
    });
  }

  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const attendanceAgg = await Attendance.aggregate([
    {
      $match: { gymId, checkInTime: { $gte: fourteenDaysAgo } },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$checkInTime' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const attendanceChart = attendanceAgg.map((a) => ({
    label: a._id,
    value: a.count,
  }));

  return {
    widgets: {
      totalMembers,
      activeMembers,
      expiredMembers,
      revenueToday,
      revenueMonth,
      newMembersThisWeek,
    },
    charts: {
      membershipGrowthChart: membershipGrowth,
      revenueChart: revenueByMonth,
      attendanceChart,
    },
  };
}
