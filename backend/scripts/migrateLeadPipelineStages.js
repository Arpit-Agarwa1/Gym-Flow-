/**
 * One-time migration: legacy lead statuses -> Hot / Warm / Cold / converted.
 * Run from backend: npm run migrate:lead-stages
 * Requires MONGO_URI in .env
 */
import 'dotenv/config';
import mongoose from 'mongoose';

const MAP = {
  new: 'hot',
  contacted: 'warm',
  trial: 'hot',
  won: 'converted',
  lost: 'cold',
};

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('Missing MONGO_URI');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const col = mongoose.connection.collection('leads');
  let total = 0;
  for (const [from, to] of Object.entries(MAP)) {
    const r = await col.updateMany({ status: from }, { $set: { status: to } });
    if (r.modifiedCount) {
      console.log(`status ${from} -> ${to}: ${r.modifiedCount} documents`);
    }
    total += r.modifiedCount;
  }
  console.log(`Done. ${total} documents updated (0 is OK if already migrated).`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
