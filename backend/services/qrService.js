import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';

/**
 * JWT embedded in QR for member check-in (short expiry).
 */
export function createCheckInToken(memberId, gymId) {
  return jwt.sign(
    { mid: memberId.toString(), gid: gymId.toString(), typ: 'checkin' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export async function qrDataUrlFromToken(token) {
  return QRCode.toDataURL(token, { margin: 1, width: 220 });
}
