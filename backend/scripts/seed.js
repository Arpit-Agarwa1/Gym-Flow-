import 'dotenv/config';
import mongoose from 'mongoose';
import User, { ROLES } from '../models/User.js';
import Gym from '../models/Gym.js';
import MembershipPlan from '../models/MembershipPlan.js';
import Member from '../models/Member.js';
import Trainer from '../models/Trainer.js';
import Payment from '../models/Payment.js';
import Attendance from '../models/Attendance.js';
import Lead from '../models/Lead.js';
import Equipment from '../models/Equipment.js';
import Class from '../models/Class.js';
import { v4 as uuidv4 } from 'uuid';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing sample collections...');
  await Promise.all([
    User.deleteMany({ email: /@example\.com$/ }),
    Gym.deleteMany({ name: 'GymFlow Demo Gym' }),
  ]);

  const gym = await Gym.create({
    name: 'GymFlow Demo Gym',
    address: '123 Neon Street',
    phone: '+91-9000000000',
    email: 'hello@gymflow.example.com',
    subscriptionPlan: 'pro',
  });

  const owner = await User.create({
    name: 'Demo Owner',
    email: 'owner@example.com',
    password: 'password123',
    role: ROLES.GYM_OWNER,
    phone: '+91-9000000001',
    gymId: gym._id,
  });

  await User.create({
    name: 'Demo Manager',
    email: 'manager@example.com',
    password: 'password123',
    role: ROLES.MANAGER,
    gymId: gym._id,
  });

  const planMonthly = await MembershipPlan.create({
    gymId: gym._id,
    name: 'Monthly Pro',
    duration: 1,
    price: 2999,
    joiningFee: 500,
    accessTime: '5am – 11pm',
    personalTrainerIncluded: false,
    description: 'Full floor access',
  });

  const memberUser = await User.create({
    name: 'Alex Member',
    email: 'member@example.com',
    password: 'password123',
    role: ROLES.MEMBER,
    gymId: gym._id,
  });

  const member = await Member.create({
    userId: memberUser._id,
    gymId: gym._id,
    membershipPlan: planMonthly._id,
    joiningDate: new Date(),
    expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    height: 175,
    weight: 72,
    emergencyContact: { name: 'Jamie', phone: '+91-9111111111' },
  });

  const trainer = await Trainer.create({
    gymId: gym._id,
    name: 'Coach Riley',
    expertise: ['HIIT', 'Strength'],
    certifications: ['ACE-CPT'],
    salary: 45000,
    experienceYears: 6,
    assignedMembers: [member._id],
    schedule: [{ day: 'Monday', start: '06:00', end: '12:00' }],
  });

  await Payment.create({
    gymId: gym._id,
    memberId: member._id,
    amount: planMonthly.price,
    paymentMethod: 'upi',
    status: 'completed',
    invoiceNumber: `INV-SEED-${uuidv4().slice(0, 8)}`,
    date: new Date(),
  });

  await Attendance.create({
    gymId: gym._id,
    memberId: member._id,
    checkInTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    checkOutTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    duration: 60,
    source: 'manual',
  });

  await Lead.create({
    gymId: gym._id,
    name: 'Sam Prospect',
    phone: '+91-9222222222',
    source: 'instagram',
    status: 'new',
    notes: 'Interested in PT bundle',
  });

  await Equipment.create({
    gymId: gym._id,
    name: 'Treadmill T-500',
    purchaseDate: new Date(),
    warranty: '2 years',
    condition: 'good',
  });

  await Class.create({
    gymId: gym._id,
    name: 'Spin Blast',
    trainer: trainer._id,
    capacity: 15,
    schedule: { day: 'Wednesday', startTime: '07:00', endTime: '08:00' },
    bookedMembers: [],
  });

  console.log('\n=== Demo accounts (password: password123) ===');
  console.log('Owner:   owner@example.com');
  console.log('Manager: manager@example.com');
  console.log('Member:  member@example.com');
  console.log('Gym ID: ', gym._id.toString());
  console.log('\nDone.');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
