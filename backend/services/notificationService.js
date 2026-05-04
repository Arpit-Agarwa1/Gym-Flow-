import Notification from '../models/Notification.js';
import { getFirebaseMessaging } from '../config/firebase.js';

/**
 * Saves notification and optionally pushes via Firebase.
 */
export async function sendNotificationToUser({ userId, message, type = 'info' }) {
  const doc = await Notification.create({ userId, message, type });
  const messaging = getFirebaseMessaging();
  if (messaging) {
    try {
      // Requires device tokens stored separately in real apps — skipped here
      await messaging.send({
        topic: `user_${userId}`,
        notification: { title: 'GymFlow', body: message },
      });
    } catch {
      /* ignore push errors */
    }
  }
  return doc;
}
