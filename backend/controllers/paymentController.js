import { v4 as uuidv4 } from 'uuid';
import Payment from '../models/Payment.js';
import Member from '../models/Member.js';
import Trainer from '../models/Trainer.js';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
} from '../services/razorpayService.js';
import { buildInvoicePdf } from '../utils/invoicePdf.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveGymId } from '../utils/gymScope.js';
import { ROLES } from '../models/User.js';
import Gym from '../models/Gym.js';

const PAYMENT_CATEGORIES = [
  'membership',
  'advance_hold',
  'personal_training',
  'other',
];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const createPayment = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });

  const memberId = req.body.memberId;
  const amount = Number(req.body.amount);
  if (!memberId || Number.isNaN(amount)) {
    return res.status(400).json({ message: 'memberId and valid amount required' });
  }

  const category = PAYMENT_CATEGORIES.includes(req.body.category)
    ? req.body.category
    : 'membership';

  let trainerId = req.body.trainerId || null;
  let trainerName = '';
  if (category === 'personal_training') {
    if (!trainerId) {
      return res
        .status(400)
        .json({ message: 'Trainer is required for personal training payments' });
    }
    const trainer = await Trainer.findOne({ _id: trainerId, gymId });
    if (!trainer) {
      return res.status(400).json({ message: 'Trainer not found for this gym' });
    }
    trainerName = (trainer.name || '').trim();
  } else {
    trainerId = null;
    trainerName = '';
  }

  const member = await Member.findOne({ _id: memberId, gymId }).populate(
    'userId'
  );
  if (!member) {
    return res.status(400).json({ message: 'Member not found for this gym' });
  }
  const memberName = (member.userId?.name || '').trim();

  const status = req.body.status === 'pending' ? 'pending' : 'completed';
  const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
  if (status === 'pending' && !dueDate) {
    return res.status(400).json({
      message: 'Due date is required when recording a pending due / installment',
    });
  }

  const notes = String(req.body.notes || '')
    .trim()
    .slice(0, 2000);

  const invoiceNumber = `INV-${Date.now()}-${uuidv4().slice(0, 8)}`;
  const payment = await Payment.create({
    gymId,
    memberId,
    amount,
    memberName,
    category,
    trainerId,
    trainerName,
    dueDate: dueDate || null,
    notes,
    paymentMethod: req.body.paymentMethod || 'cash',
    status,
    invoiceNumber,
    transactionId: req.body.transactionId || '',
    razorpayOrderId: req.body.razorpayOrderId || '',
    razorpayPaymentId: req.body.razorpayPaymentId || '',
    date: req.body.date ? new Date(req.body.date) : new Date(),
  });
  res.status(201).json(payment);
});

export const paymentHistory = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const filter = { gymId };
  if (req.query.memberId) filter.memberId = req.query.memberId;
  if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category && PAYMENT_CATEGORIES.includes(req.query.category)) {
    filter.category = req.query.category;
  }
  if (req.query.trainerId) filter.trainerId = req.query.trainerId;

  if (req.query.overdue === 'true' || req.query.overdue === '1') {
    filter.status = 'pending';
    filter.dueDate = { ...filter.dueDate, $lt: startOfToday() };
  }

  const dueWithin = Number(req.query.dueWithinDays);
  if (Number.isFinite(dueWithin) && dueWithin > 0 && !filter.dueDate) {
    const end = new Date();
    end.setDate(end.getDate() + dueWithin);
    end.setHours(23, 59, 59, 999);
    filter.status = 'pending';
    filter.dueDate = { $gte: startOfToday(), $lte: end };
  }

  const { from, to } = req.query;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  const items = await Payment.find(filter)
    .populate({ path: 'memberId', populate: { path: 'userId' } })
    .populate({ path: 'trainerId', select: 'name' })
    .sort({ date: -1 });
  res.json(items);
});

/** Mark a pending due as collected (staff). */
export const patchPayment = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const payment = await Payment.findOne({ _id: req.params.id, gymId });
  if (!payment) return res.status(404).json({ message: 'Payment not found' });

  if (payment.status !== 'pending') {
    return res.status(400).json({ message: 'Only pending payments can be updated this way' });
  }
  if (req.body.status !== 'completed') {
    return res.status(400).json({ message: 'Set status to completed when marking as paid' });
  }

  payment.status = 'completed';
  payment.paymentMethod = req.body.paymentMethod || payment.paymentMethod || 'cash';
  payment.date = req.body.date ? new Date(req.body.date) : new Date();
  await payment.save();

  const populated = await Payment.findById(payment._id)
    .populate({ path: 'memberId', populate: { path: 'userId' } })
    .populate({ path: 'trainerId', select: 'name' });

  res.json(populated);
});

export const razorpayCreateOrder = asyncHandler(async (req, res) => {
  const { amount, memberId } = req.body;
  const amountPaise = Math.round(Number(amount) * 100);
  const order = await createRazorpayOrder(amountPaise, `m_${memberId}`);
  res.json(order);
});

export const razorpayVerify = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature, memberId, amount } = req.body;
  const ok = verifyRazorpaySignature(orderId, paymentId, signature);
  if (!ok) return res.status(400).json({ message: 'Invalid signature' });
  const gymId = resolveGymId(req);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });

  const member = await Member.findOne({ _id: memberId, gymId }).populate(
    'userId'
  );
  if (!member) {
    return res.status(400).json({ message: 'Member not found for this gym' });
  }
  const memberName = (member.userId?.name || '').trim();

  const invoiceNumber = `INV-${Date.now()}-${uuidv4().slice(0, 8)}`;
  const payment = await Payment.create({
    gymId,
    memberId,
    memberName,
    category: 'membership',
    amount: Number(amount),
    paymentMethod: 'razorpay',
    status: 'completed',
    invoiceNumber,
    transactionId: paymentId,
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
  });
  res.json(payment);
});

export const deletePayment = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const payment = await Payment.findOne({ _id: req.params.id, gymId });
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  await payment.deleteOne();
  res.json({ message: 'Payment deleted' });
});

export const invoicePdf = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate({
    path: 'memberId',
    populate: { path: 'userId' },
  });
  if (!payment) return res.status(404).json({ message: 'Not found' });

  const scopeGymId = resolveGymId(req);
  if (req.user.role !== ROLES.SUPER_ADMIN) {
    if (!scopeGymId || String(payment.gymId) !== String(scopeGymId)) {
      return res.status(403).json({ message: 'Not authorized for this invoice' });
    }
  }

  const gym = await Gym.findById(payment.gymId);
  const memberUser = payment.memberId?.userId;
  const buffer = await buildInvoicePdf({
    gymName: gym?.name,
    invoiceNumber: payment.invoiceNumber,
    memberName: payment.memberName || memberUser?.name || 'Member',
    amount: payment.amount,
    date: payment.date,
    category: payment.category,
    notes: payment.notes,
    trainerName: payment.trainerName,
    dueDate: payment.dueDate,
  });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${payment.invoiceNumber}.pdf"`
  );
  res.send(buffer);
});
