import Member from '../models/Member.js';
import Lead from '../models/Lead.js';
import { sendMail } from './emailService.js';

function daysAgo(d) {
  const x = new Date();
  x.setDate(x.getDate() - d);
  return x;
}

/**
 * Resolves segment to member user emails + sends (email channel only fully wired).
 */
export async function sendCampaign(campaign) {
  const { gymId, segment, subject, body, channel } = campaign;
  let recipients = [];

  if (segment === 'all_members') {
    const members = await Member.find({ gymId }).populate('userId');
    recipients = members.map((m) => m.userId?.email).filter(Boolean);
  } else if (segment === 'expiring_7d' || segment === 'expiring_30d') {
    const days = segment === 'expiring_7d' ? 7 : 30;
    const now = new Date();
    const end = new Date(now.getTime() + days * 86400000);
    const members = await Member.find({
      gymId,
      expiryDate: { $gte: now, $lte: end },
    }).populate('userId');
    recipients = members.map((m) => m.userId?.email).filter(Boolean);
  } else if (segment === 'dormant_30d') {
    const since = daysAgo(30);
    const activeMemberIds = await Member.distinct('_id', {
      gymId,
      updatedAt: { $gte: since },
    });
    const dormant = await Member.find({
      gymId,
      _id: { $nin: activeMemberIds },
    }).populate('userId');
    recipients = dormant.map((m) => m.userId?.email).filter(Boolean);
  } else if (segment === 'all_leads') {
    const leads = await Lead.find({ gymId });
    recipients = leads.map((l) => null);
    for (const l of leads) {
      console.info('[campaign sms/whatsapp stub]', channel, l.phone, body);
    }
  }

  let sent = 0;
  for (const to of recipients) {
    if (channel === 'email') {
      await sendMail({ to, subject, text: body });
      sent += 1;
    } else {
      console.info('[campaign channel stub]', channel, to || 'lead', body);
      sent += 1;
    }
  }

  campaign.status = 'sent';
  campaign.sentCount = sent;
  await campaign.save();
  return { sent };
}
