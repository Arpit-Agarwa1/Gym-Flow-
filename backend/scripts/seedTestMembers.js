import 'dotenv/config';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User, { ROLES } from '../models/User.js';
import Gym from '../models/Gym.js';
import MembershipPlan from '../models/MembershipPlan.js';
import Member from '../models/Member.js';

/** Email domain for seeded rows — easy to target with --clean */
const SEED_EMAIL_DOMAIN = 'gymflow-seed.test';
const DEFAULT_PASSWORD = 'password123';

const FIRST_NAMES = [
  'Aarav', 'Vihaan', 'Aditya', 'Ananya', 'Diya', 'Ishaan', 'Kavya', 'Neha', 'Rohan', 'Sneha',
  'Arjun', 'Dev', 'Kabir', 'Meera', 'Priya', 'Rahul', 'Sanjay', 'Tara', 'Vikram', 'Zara',
  'Chris', 'Jordan', 'Alex', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Quinn',
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Singh', 'Reddy', 'Iyer', 'Kapoor', 'Menon', 'Nair', 'Das', 'Ghosh',
  'Kumar', 'Verma', 'Joshi', 'Malhotra', 'Banerjee', 'Choudhury', 'Mehta', 'Pillai', 'Rao', 'Shah',
  'Smith', 'Johnson', 'Brown', 'Garcia', 'Martinez', 'Lee', 'Walker', 'Hall', 'Young', 'King',
];

/**
 * Parses CLI args for bulk member seeding.
 * @returns {{ count: number; clean: boolean }}
 */
function parseArgs() {
  let count = Number(process.env.SEED_MEMBER_COUNT);
  if (!Number.isFinite(count) || count < 1) count = 50;
  count = Math.min(500, Math.max(1, Math.floor(count)));

  let clean = false;
  for (const a of process.argv.slice(2)) {
    if (a === '--clean') clean = true;
    const m = a.match(/^--count=(\d+)$/);
    if (m) count = Math.min(500, Math.max(1, parseInt(m[1], 10)));
  }
  return { count, clean };
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Builds a unique referral code for Member.referralCode */
function makeReferralCode() {
  return `S${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function cleanSeedRows() {
  const escaped = SEED_EMAIL_DOMAIN.replace(/\./g, '\\.');
  const seedUsers = await User.find({
    email: new RegExp(`@${escaped}$`),
  }).select('_id');
  const ids = seedUsers.map((u) => u._id);
  if (!ids.length) {
    console.log('No previous gymflow-seed.test users to remove.');
    return;
  }
  await Member.deleteMany({ userId: { $in: ids } });
  await User.deleteMany({ _id: { $in: ids } });
  console.log(`Removed ${ids.length} previous seed users and their member profiles.`);
}

async function run() {
  const { count, clean } = parseArgs();
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set. Copy backend/.env.example to .env and set MONGO_URI.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB.');

  if (clean) await cleanSeedRows();

  let gym;
  const envGymId = process.env.SEED_GYM_ID?.trim();
  if (envGymId) gym = await Gym.findById(envGymId);
  else gym = await Gym.findOne().sort({ createdAt: 1 });

  if (!gym) {
    console.error(
      'No gym found. Run `npm run seed` once to create a demo gym, or set SEED_GYM_ID in .env to your gym\'s ObjectId.'
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  const plan = await MembershipPlan.findOne({ gymId: gym._id }).sort({ createdAt: 1 });
  const durationMonths = plan?.duration ?? 1;

  let created = 0;
  for (let i = 0; i < count; i += 1) {
    const token = crypto.randomBytes(8).toString('hex');
    const email = `seed.${token}@${SEED_EMAIL_DOMAIN}`;
    const name = `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
    const phone = `+91-9${randomInt(100000000, 999999999)}`;
    const height = randomInt(155, 195);
    const weight = randomInt(52, 110);
    const joiningDate = new Date(Date.now() - randomInt(0, 180) * 24 * 60 * 60 * 1000);

    let expiryDate = new Date(joiningDate);
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
    if (Math.random() < 0.12) {
      expiryDate = new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000);
    }

    const user = await User.create({
      name,
      email,
      password: DEFAULT_PASSWORD,
      role: ROLES.MEMBER,
      phone,
      gymId: gym._id,
    });

    let referralCode = makeReferralCode();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const exists = await Member.exists({ referralCode });
      if (!exists) break;
      referralCode = makeReferralCode();
    }

    await Member.create({
      userId: user._id,
      gymId: gym._id,
      membershipPlan: plan?._id ?? null,
      joiningDate,
      expiryDate,
      referralCode,
      emergencyContact: {
        name: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
        phone: `+91-9${randomInt(100000000, 999999999)}`,
      },
      height,
      weight,
      notes: 'Seeded test member',
    });
    created += 1;
  }

  console.log(`\nCreated ${created} test members for gym "${gym.name}" (${gym._id}).`);
  if (plan) console.log(`Linked to plan: "${plan.name}" (${plan._id}).`);
  console.log(`All seeded accounts use password: ${DEFAULT_PASSWORD}`);
  console.log(`Emails match *@${SEED_EMAIL_DOMAIN} — remove with: node scripts/seedTestMembers.js --clean\n`);

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
