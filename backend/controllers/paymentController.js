import { v4 as uuidv4 } from 'uuid';
import Payment from '../models/Payment.js';
import Member from '../models/Member.js';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
} from '../services/razorpayService.js';
import { buildInvoicePdf } from '../utils/invoicePdf.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveGymId } from '../utils/gymScope.js';
import Gym from '../models/Gym.js';

export const createPayment = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const invoiceNumber = `INV-${Date.now()}-${uuidv4().slice(0, 8)}`;
  const payment = await Payment.create({
    ...req.body,
    gymId,
    invoiceNumber,
    date: req.body.date ? new Date(req.body.date) : new Date(),
  });
  res.status(201).json(payment);
});

export const paymentHistory = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const filter = { gymId };
  if (req.query.memberId) filter.memberId = req.query.memberId;
  const items = await Payment.find(filter)
    .populate({ path: 'memberId', populate: { path: 'userId' } })
    .sort({ date: -1 });
  res.json(items);
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
  const invoiceNumber = `INV-${Date.now()}-${uuidv4().slice(0, 8)}`;
  const payment = await Payment.create({
    gymId,
    memberId,
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

/** Removes a payment row for this gym (managers/owners only — see route). */
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
  const gym = await Gym.findById(payment.gymId);
  const memberUser = payment.memberId?.userId;
  const buffer = await buildInvoicePdf({
    gymName: gym?.name,
    invoiceNumber: payment.invoiceNumber,
    memberName: memberUser?.name || 'Member',
    amount: payment.amount,
    date: payment.date,
  });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${payment.invoiceNumber}.pdf"`
  );
  res.send(buffer);
});
