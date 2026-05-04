import admin from 'firebase-admin';

let firebaseReady = false;

/**
 * Firebase Admin is optional. Used for push notifications when configured.
 */
export function initFirebase() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      'Firebase Admin not configured — notifications are saved in DB + Socket.io only.'
    );
    return false;
  }
  try {
    privateKey = privateKey.replace(/\\n/g, '\n');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
    firebaseReady = true;
    return true;
  } catch (e) {
    console.warn('Firebase init failed:', e.message);
    return false;
  }
}

export function getFirebaseMessaging() {
  if (!firebaseReady) return null;
  try {
    return admin.messaging();
  } catch {
    return null;
  }
}
