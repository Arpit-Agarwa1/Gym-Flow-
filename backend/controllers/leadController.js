import Lead from '../models/Lead.js';
import Member from '../models/Member.js';
import User, { ROLES } from '../models/User.js';
import MembershipPlan from '../models/MembershipPlan.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveGymId } from '../utils/gymScope.js';

export const listLeads = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  const filter = { gymId };
  if (req.query.followUp === 'due') {
    filter.status = { $ne: 'converted' };
    filter.nextFollowUpAt = { $lte: new Date(), $ne: null };
  }
  const sort =
    req.query.followUp === 'due'
      ? { nextFollowUpAt: 1 }
      : { createdAt: -1 };
  const rows = await Lead.find(filter)
    .sort(sort)
    .populate({ path: 'assignedTrainerId', select: 'name' });
  res.json(rows);
});

export const addLead = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const lead = await Lead.create({ ...req.body, gymId });
  const populated = await Lead.findById(lead._id).populate({
    path: 'assignedTrainerId',
    select: 'name',
  });
  res.status(201).json(populated);
});

export const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  }).populate({ path: 'assignedTrainerId', select: 'name' });
  if (!lead) return res.status(404).json({ message: 'Not found' });
  res.json(lead);
});

/** Converts lead to member user + profile */
export const convertLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id).populate({
    path: 'assignedTrainerId',
    select: 'name',
  });
  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  const email =
    req.body.email ||
    `lead_${lead._id}@placeholder.local`;
  const password = req.body.password || 'changeme123';

  const user = await User.create({
    name: lead.name,
    email,
    password,
    role: ROLES.MEMBER,
    phone: lead.phone,
    gymId: lead.gymId,
  });

  let expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  if (req.body.membershipPlanId) {
    const plan = await MembershipPlan.findById(req.body.membershipPlanId);
    if (plan) {
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + plan.duration);
    }
  }

  const followUpLog = (lead.followUpEntries || [])
    .map((e) => (e?.content || '').trim())
    .filter(Boolean)
    .join(' | ');
  const referralLine = (lead.referralMemberName || '').trim()
    ? `Referred by member: ${(lead.referralMemberName || '').trim()}`
    : '';
  const genderLabels = { male: 'Male', female: 'Female', other: 'Other' };
  const genderLine =
    lead.gender && lead.gender !== 'unspecified'
      ? genderLabels[lead.gender]
        ? `Gender (from inquiry): ${genderLabels[lead.gender]}`
        : ''
      : '';
  const trainerName =
    lead.assignedTrainerId &&
    typeof lead.assignedTrainerId === 'object' &&
    lead.assignedTrainerId.name
      ? String(lead.assignedTrainerId.name).trim()
      : '';
  const trainerLine = trainerName
    ? `Trainer (from inquiry): ${trainerName}`
    : '';
  const leadBits = [
    followUpLog,
    lead.remarks,
    lead.notes,
    referralLine,
    genderLine,
    trainerLine,
  ]
    .filter(Boolean)
    .join(' | ');
  const trainerRef =
    lead.assignedTrainerId &&
    typeof lead.assignedTrainerId === 'object' &&
    lead.assignedTrainerId._id
      ? lead.assignedTrainerId._id
      : lead.assignedTrainerId || null;

  const member = await Member.create({
    userId: user._id,
    gymId: lead.gymId,
    membershipPlan: req.body.membershipPlanId || null,
    joiningDate: new Date(),
    expiryDate,
    assignedTrainerId: trainerRef,
    notes: `Converted from lead.${leadBits ? ` ${leadBits}` : ''}`,
  });

  lead.status = 'converted';
  await lead.save();

  const populated = await Member.findById(member._id)
    .populate('userId')
    .populate('membershipPlan');
  res.status(201).json({ member: populated, lead });
});
