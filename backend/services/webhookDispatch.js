import crypto from 'crypto';
import WebhookSubscription from '../models/WebhookSubscription.js';

function sign(secret, body) {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

/**
 * POST signed JSON to subscribers for an event key.
 */
export async function dispatchWebhooks(gymId, eventKey, payload) {
  const subs = await WebhookSubscription.find({
    gymId,
    active: true,
    events: { $in: [eventKey, '*'] },
  });
  const body = JSON.stringify({ event: eventKey, payload, at: new Date().toISOString() });
  await Promise.all(
    subs.map(async (s) => {
      try {
        const sig = sign(s.secret, body);
        const res = await fetch(s.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-GymFlow-Signature': sig,
          },
          body,
        });
        s.lastTriggeredAt = new Date();
        if (!res.ok) s.failureCount += 1;
        await s.save();
      } catch {
        s.failureCount += 1;
        await s.save();
      }
    })
  );
}
