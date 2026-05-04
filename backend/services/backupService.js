import Member from '../models/Member.js';
import Payment from '../models/Payment.js';
import Lead from '../models/Lead.js';
import Product from '../models/Product.js';

/**
 * JSON snapshot of gym operational data (not a full Mongo dump).
 */
export async function exportGymSnapshot(gymId) {
  const [members, payments, leads, products] = await Promise.all([
    Member.find({ gymId }).populate('userId').populate('membershipPlan').lean(),
    Payment.find({ gymId }).lean(),
    Lead.find({ gymId }).lean(),
    Product.find({ gymId }).lean(),
  ]);
  return {
    exportedAt: new Date().toISOString(),
    gymId: String(gymId),
    counts: {
      members: members.length,
      payments: payments.length,
      leads: leads.length,
      products: products.length,
    },
    members,
    payments,
    leads,
    products,
  };
}
