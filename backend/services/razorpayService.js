import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpayInstance = null;

function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({ key_id, key_secret });
  }
  return razorpayInstance;
}

/**
 * Creates a Razorpay order or returns a mock order for local dev without keys.
 */
export async function createRazorpayOrder(amountPaise, receipt) {
  const rp = getRazorpay();
  if (!rp) {
    return {
      mock: true,
      id: `mock_order_${Date.now()}`,
      amount: amountPaise,
      currency: 'INR',
      receipt: receipt || 'rcpt_local',
    };
  }
  const order = await rp.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt: receipt || `rcpt_${Date.now()}`,
  });
  return { mock: false, ...order };
}

export function verifyRazorpaySignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    // Without secret we cannot verify — treat as dev skip
    return process.env.NODE_ENV !== 'production';
  }
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expected === signature;
}
