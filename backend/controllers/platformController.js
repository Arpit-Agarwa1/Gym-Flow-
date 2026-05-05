import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import Member from '../models/Member.js';
import TrialPass from '../models/TrialPass.js';
import Subscription from '../models/Subscription.js';
import { WaiverTemplate, WaiverSignature } from '../models/Waiver.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import Shift from '../models/Shift.js';
import { TaskTemplate, TaskRun } from '../models/GymTask.js';
import Campaign from '../models/Campaign.js';
import WebhookSubscription from '../models/WebhookSubscription.js';
import ApiKey from '../models/ApiKey.js';
import Gym from '../models/Gym.js';
import Payment from '../models/Payment.js';
import Lead from '../models/Lead.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveGymId } from '../utils/gymScope.js';
import { logAudit } from '../services/auditService.js';
import { exportGymSnapshot } from '../services/backupService.js';
import { processRenewalReminders } from '../services/reminderService.js';
import { sendCampaign } from '../services/campaignSendService.js';
import { dispatchWebhooks } from '../services/webhookDispatch.js';

function clientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
}

export const listAuditLogs = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const rows = await AuditLog.find({ gymId })
    .populate('actorUserId', 'name email')
    .sort({ createdAt: -1 })
    .limit(200);
  res.json(rows);
});

export const generateReferralCode = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const member = await Member.findOne({ _id: req.params.memberId, gymId });
  if (!member) return res.status(404).json({ message: 'Member not found' });
  const code = `GF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  member.referralCode = code;
  await member.save();
  await logAudit({
    gymId,
    actorUserId: req.user._id,
    action: 'referral.generate',
    resource: 'Member',
    resourceId: member._id,
    meta: { code },
    ip: clientIp(req),
  });
  res.json({ referralCode: code });
});

export const referralStats = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const referred = await Member.countDocuments({
    gymId,
    referredByMemberId: { $ne: null },
  });
  const withCode = await Member.countDocuments({
    gymId,
    referralCode: { $exists: true, $ne: '' },
  });
  res.json({ referredMembers: referred, membersWithReferralCode: withCode });
});

export const listTrialPasses = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const rows = await TrialPass.find({ gymId }).sort({ validTo: -1 }).limit(100);
  res.json(rows);
});

export const createTrialPass = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  const row = await TrialPass.create({ ...req.body, gymId });
  await logAudit({
    gymId,
    actorUserId: req.user._id,
    action: 'trial.create',
    resource: 'TrialPass',
    resourceId: row._id,
    ip: clientIp(req),
  });
  await dispatchWebhooks(gymId, 'trial.created', { trialPassId: row._id });
  res.status(201).json(row);
});

export const deleteTrialPass = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  await TrialPass.findOneAndDelete({ _id: req.params.id, gymId });
  res.json({ ok: true });
});

export const listSubscriptions = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const rows = await Subscription.find({ gymId })
    .populate({
      path: 'memberId',
      populate: { path: 'userId', select: 'name email phone' },
    })
    .populate('membershipPlanId')
    .sort({ updatedAt: -1 });
  res.json(rows);
});

export const createSubscription = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  const row = await Subscription.create({ ...req.body, gymId });
  await logAudit({
    gymId,
    actorUserId: req.user._id,
    action: 'subscription.create',
    resource: 'Subscription',
    resourceId: row._id,
    ip: clientIp(req),
  });
  await dispatchWebhooks(gymId, 'subscription.created', {
    subscriptionId: row._id,
  });
  res.status(201).json(row);
});

export const patchSubscription = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const row = await Subscription.findOneAndUpdate(
    { _id: req.params.id, gymId },
    req.body,
    { new: true }
  );
  if (!row) return res.status(404).json({ message: 'Not found' });
  res.json(row);
});

export const listWaiverTemplates = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const rows = await WaiverTemplate.find({ gymId });
  res.json(rows);
});

export const createWaiverTemplate = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  const row = await WaiverTemplate.create({ ...req.body, gymId });
  res.status(201).json(row);
});

export const signWaiver = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const { memberId, templateId } = req.body;
  const tpl = await WaiverTemplate.findOne({ _id: templateId, gymId });
  const member = await Member.findOne({ _id: memberId, gymId });
  if (!tpl || !member)
    return res.status(400).json({ message: 'Invalid template or member' });
  const sig = await WaiverSignature.create({
    gymId,
    memberId,
    templateId,
    templateVersion: tpl.version,
    signerIp: clientIp(req),
  });
  await logAudit({
    gymId,
    actorUserId: req.user._id,
    action: 'waiver.sign',
    resource: 'WaiverSignature',
    resourceId: sig._id,
    ip: clientIp(req),
  });
  res.status(201).json(sig);
});

export const listProducts = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  res.json(await Product.find({ gymId }).sort({ name: 1 }));
});

export const createProduct = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  const row = await Product.create({ ...req.body, gymId });
  res.status(201).json(row);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const row = await Product.findOneAndUpdate(
    { _id: req.params.id, gymId },
    req.body,
    { new: true }
  );
  if (!row) return res.status(404).json({ message: 'Not found' });
  res.json(row);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  await Product.findOneAndDelete({ _id: req.params.id, gymId });
  res.json({ ok: true });
});

export const createSale = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  const { lines, paymentMethod, memberId } = req.body;
  let total = 0;
  for (const line of lines) {
    const p = await Product.findOne({ _id: line.productId, gymId });
    if (!p) return res.status(400).json({ message: 'Invalid product' });
    const qty = line.qty || 1;
    const raw = line.unitPrice;
    const unit =
      raw != null && !Number.isNaN(Number(raw)) ? Number(raw) : p.price;
    total += qty * unit;
    if (p.stockQty < qty) return res.status(400).json({ message: 'Stock low' });
    p.stockQty -= qty;
    await p.save();
  }
  const sale = await Sale.create({
    gymId,
    lines,
    total,
    paymentMethod: paymentMethod || 'cash',
    memberId: memberId || null,
    createdByUserId: req.user._id,
  });
  await logAudit({
    gymId,
    actorUserId: req.user._id,
    action: 'pos.sale',
    resource: 'Sale',
    resourceId: sale._id,
    meta: { total },
    ip: clientIp(req),
  });
  await dispatchWebhooks(gymId, 'sale.created', { saleId: sale._id, total });
  res.status(201).json(sale);
});

export const listShifts = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const rows = await Shift.find({ gymId })
    .populate('staffUserId', 'name email role')
    .sort({ start: -1 })
    .limit(200);
  res.json(rows);
});

export const createShift = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  const row = await Shift.create({ ...req.body, gymId });
  res.status(201).json(row);
});

export const deleteShift = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  await Shift.findOneAndDelete({ _id: req.params.id, gymId });
  res.json({ ok: true });
});

export const listTaskTemplates = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  res.json(await TaskTemplate.find({ gymId }));
});

export const createTaskTemplate = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  const row = await TaskTemplate.create({ ...req.body, gymId });
  res.status(201).json(row);
});

export const completeTaskRun = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const { templateId, checklistState } = req.body;
  const tpl = await TaskTemplate.findOne({ _id: templateId, gymId });
  if (!tpl) return res.status(404).json({ message: 'Template not found' });
  const run = await TaskRun.create({
    gymId,
    templateId,
    completedByUserId: req.user._id,
    checklistState:
      checklistState ||
      tpl.items.map((item) => ({ item, done: false })),
  });
  res.status(201).json(run);
});

export const listTaskRuns = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const rows = await TaskRun.find({ gymId })
    .populate('completedByUserId', 'name')
    .sort({ completedAt: -1 })
    .limit(50);
  res.json(rows);
});

export const listCampaigns = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  res.json(await Campaign.find({ gymId }).sort({ createdAt: -1 }));
});

export const createCampaign = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  const row = await Campaign.create({ ...req.body, gymId });
  res.status(201).json(row);
});

export const sendCampaignNow = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const c = await Campaign.findOne({ _id: req.params.id, gymId });
  if (!c) return res.status(404).json({ message: 'Not found' });
  c.status = 'sending';
  await c.save();
  const result = await sendCampaign(c);
  await logAudit({
    gymId,
    actorUserId: req.user._id,
    action: 'campaign.send',
    resource: 'Campaign',
    resourceId: c._id,
    meta: result,
    ip: clientIp(req),
  });
  res.json(result);
});

export const listWebhooks = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const rows = await WebhookSubscription.find({ gymId });
  res.json(
    rows.map((w) => ({
      ...w.toObject(),
      secret: undefined,
    }))
  );
});

export const createWebhook = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  const secret = crypto.randomBytes(32).toString('hex');
  const row = await WebhookSubscription.create({
    gymId,
    url: req.body.url,
    events: Array.isArray(req.body.events) ? req.body.events : [],
    active: req.body.active !== false,
    secret,
  });
  await logAudit({
    gymId,
    actorUserId: req.user._id,
    action: 'webhook.create',
    resource: 'WebhookSubscription',
    resourceId: row._id,
    ip: clientIp(req),
  });
  res.status(201).json({ ...row.toObject(), secret });
});

export const deleteWebhook = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  await WebhookSubscription.findOneAndDelete({ _id: req.params.id, gymId });
  res.json({ ok: true });
});

export const listApiKeys = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const rows = await ApiKey.find({ gymId }).select('-keyHash');
  res.json(rows);
});

export const createApiKey = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  const raw = `gf_${crypto.randomBytes(24).toString('hex')}`;
  const keyHash = await bcrypt.hash(raw, 10);
  const keyPrefix = raw.slice(0, 12);
  const row = await ApiKey.create({
    gymId,
    name: req.body.name || 'Integration',
    keyPrefix,
    keyHash,
  });
  await logAudit({
    gymId,
    actorUserId: req.user._id,
    action: 'apikey.create',
    resource: 'ApiKey',
    resourceId: row._id,
    ip: clientIp(req),
  });
  res.status(201).json({ id: row._id, key: raw, keyPrefix, warning: 'Save now; key is not shown again.' });
});

export const deleteApiKey = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  await ApiKey.findOneAndDelete({ _id: req.params.id, gymId });
  res.json({ ok: true });
});

export const globalSearch = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json({ members: [], leads: [], payments: [] });
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const users = await User.find({
    $or: [{ name: rx }, { email: rx }, { phone: rx }],
  }).select('_id name email phone');
  const userIds = users.map((u) => u._id);
  const members = await Member.find({
    gymId,
    userId: { $in: userIds },
  })
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

export const runRenewalReminders = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const days = Number(req.body.days || req.query.days || 14);
  const result = await processRenewalReminders(gymId, days);
  await logAudit({
    gymId,
    actorUserId: req.user._id,
    action: 'reminders.run',
    resource: 'Gym',
    resourceId: gymId,
    meta: result,
    ip: clientIp(req),
  });
  res.json(result);
});

export const backupExport = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const snap = await exportGymSnapshot(gymId);
  await logAudit({
    gymId,
    actorUserId: req.user._id,
    action: 'backup.export',
    resource: 'Gym',
    resourceId: gymId,
    ip: clientIp(req),
  });
  res.json(snap);
});

export const gdprExportMember = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const member = await Member.findOne({
    _id: req.params.memberId,
    gymId,
  }).populate('userId');
  if (!member) return res.status(404).json({ message: 'Not found' });
  const user = member.userId;
  const payments = await Payment.find({ memberId: member._id });
  const attendance = await Attendance.find({ memberId: member._id }).limit(
    500
  );
  const signatures = await WaiverSignature.find({ memberId: member._id });
  await logAudit({
    gymId,
    actorUserId: req.user._id,
    action: 'gdpr.export',
    resource: 'Member',
    resourceId: member._id,
    ip: clientIp(req),
  });
  res.json({
    exportedAt: new Date().toISOString(),
    member: member.toObject(),
    user: user
      ? { name: user.name, email: user.email, phone: user.phone }
      : null,
    payments,
    attendance,
    waivers: signatures,
  });
});

export const gdprAnonymizeMember = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const member = await Member.findOne({
    _id: req.params.memberId,
    gymId,
  });
  if (!member) return res.status(404).json({ message: 'Not found' });
  const user = await User.findById(member.userId);
  if (user) {
    user.name = 'Redacted user';
    user.email = `redacted_${user._id}@anonymized.local`;
    user.phone = '';
    await user.save();
  }
  member.notes = '';
  member.injuries = '';
  member.emergencyContact = undefined;
  await member.save();
  await logAudit({
    gymId,
    actorUserId: req.user._id,
    action: 'gdpr.anonymize',
    resource: 'Member',
    resourceId: member._id,
    ip: clientIp(req),
  });
  res.json({ ok: true });
});

export const franchiseSummary = asyncHandler(async (req, res) => {
  const raw =
    req.query.parentId || resolveGymId(req)?.toString() || req.user.gymId;
  if (!raw || !mongoose.isValidObjectId(raw)) {
    return res.status(400).json({ message: 'Valid parentId required' });
  }
  const parentId = new mongoose.Types.ObjectId(raw);
  const branches = await Gym.find({ parentGymId: parentId }).select(
    'name _id'
  );
  const ids = [parentId, ...branches.map((b) => b._id)];
  const revenue = await Payment.aggregate([
    { $match: { gymId: { $in: ids }, status: 'completed' } },
    { $group: { _id: '$gymId', total: { $sum: '$amount' } } },
  ]);
  const memberCounts = await Promise.all(
    ids.map(async (id) => ({
      gymId: id,
      members: await Member.countDocuments({ gymId: id }),
    }))
  );
  res.json({ branches, revenue, memberCounts });
});
