import Member from '../models/Member.js';
import User, { ROLES } from '../models/User.js';
import Trainer from '../models/Trainer.js';
import MembershipPlan from '../models/MembershipPlan.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveGymId } from '../utils/gymScope.js';

export const listMembers = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const q = req.query.search
    ? {
        gymId,
        $or: [{ notes: new RegExp(req.query.search, 'i') }],
      }
    : { gymId };
  const members = await Member.find(q)
    .populate('userId', 'name email phone profilePhoto role')
    .populate('membershipPlan')
    .populate('assignedTrainerId')
    .sort({ createdAt: -1 });
  res.json(members);
});

export const getMember = asyncHandler(async (req, res) => {
  const m = await Member.findById(req.params.id)
    .populate('userId')
    .populate('membershipPlan')
    .populate('assignedTrainerId');
  if (!m) return res.status(404).json({ message: 'Member not found' });
  res.json(m);
});

/** Creates linked User (Member role) + Member profile */
export const addMember = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req, req.body.gymId);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const {
    name,
    email,
    password,
    phone,
    membershipPlanId,
    emergencyContact,
    height,
    weight,
    injuries,
    notes,
    joiningDate,
    expiryDate,
    referredByCode,
  } = req.body;

  let referredByMemberId = null;
  if (referredByCode) {
    const ref = await Member.findOne({
      gymId,
      referralCode: referredByCode.trim(),
    });
    if (ref) referredByMemberId = ref._id;
  }

  const user = await User.create({
    name,
    email,
    password: password || 'changeme123',
    role: ROLES.MEMBER,
    phone,
    gymId,
  });

  let exp = expiryDate ? new Date(expiryDate) : null;
  if (!exp && membershipPlanId) {
    const plan = await MembershipPlan.findById(membershipPlanId);
    if (plan) {
      exp = new Date();
      exp.setMonth(exp.getMonth() + plan.duration);
    }
  }
  if (!exp) {
    exp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const member = await Member.create({
    userId: user._id,
    gymId,
    membershipPlan: membershipPlanId || null,
    joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
    expiryDate: exp,
    emergencyContact,
    height,
    weight,
    injuries,
    notes,
    referredByMemberId,
  });

  const populated = await Member.findById(member._id)
    .populate('userId')
    .populate('membershipPlan');
  res.status(201).json(populated);
});

export const updateMember = asyncHandler(async (req, res) => {
  const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  })
    .populate('userId')
    .populate('membershipPlan');
  if (!member) return res.status(404).json({ message: 'Member not found' });

  if (req.body.userPatch) {
    await User.findByIdAndUpdate(member.userId, req.body.userPatch);
  }
  res.json(member);
});

export const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) return res.status(404).json({ message: 'Member not found' });
  await User.findByIdAndDelete(member.userId);
  await member.deleteOne();
  res.json({ message: 'Deleted' });
});

export const freezeMembership = asyncHandler(async (req, res) => {
  const member = await Member.findByIdAndUpdate(
    req.params.id,
    { frozen: req.body.frozen !== false },
    { new: true }
  );
  if (!member) return res.status(404).json({ message: 'Member not found' });
  res.json(member);
});

export const assignTrainer = asyncHandler(async (req, res) => {
  const { trainerId } = req.body;
  const member = await Member.findById(req.params.id);
  if (!member) return res.status(404).json({ message: 'Member not found' });
  member.assignedTrainerId = trainerId;
  await member.save();
  if (trainerId) {
    await Trainer.findByIdAndUpdate(trainerId, {
      $addToSet: { assignedMembers: member._id },
    });
  }
  res.json(member);
});
