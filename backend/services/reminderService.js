import Member from '../models/Member.js';
import { sendMail } from './emailService.js';
import { dispatchWebhooks } from './webhookDispatch.js';

/**
 * Finds memberships expiring within `days` and sends reminder email (or stub).
 */
export async function processRenewalReminders(gymId, days = 14) {
  const now = new Date();
  const horizon = new Date(now.getTime() + days * 86400000);
  const members = await Member.find({
    gymId,
    frozen: false,
    expiryDate: { $gte: now, $lte: horizon },
  }).populate('userId');

  const results = [];
  for (const m of members) {
    if (m.lastRenewalReminderAt) {
      const delta = now - m.lastRenewalReminderAt;
      if (delta < 5 * 86400000) continue;
    }
    const user = m.userId;
    if (!user?.email) continue;
    await sendMail({
      to: user.email,
      subject: 'Membership renewal reminder',
      text: `Hi ${user.name}, your membership is set to expire on ${new Date(m.expiryDate).toDateString()}. Please renew at the front desk or online.`,
    });
    m.lastRenewalReminderAt = now;
    await m.save();
    results.push(String(m._id));
  }
  await dispatchWebhooks(gymId, 'renewal.reminder_batch', {
    count: results.length,
    memberIds: results,
  });
  return { reminded: results.length, memberIds: results };
}
