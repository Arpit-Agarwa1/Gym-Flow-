import bcrypt from 'bcryptjs';
import ApiKey from '../models/ApiKey.js';

/** Validates X-Api-Key header for integration endpoints */
export async function apiKeyAuth(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key || typeof key !== 'string') {
    return res.status(401).json({ message: 'x-api-key header required' });
  }
  const prefix = key.slice(0, 12);
  const candidates = await ApiKey.find({ keyPrefix: prefix });
  for (const c of candidates) {
    if (await bcrypt.compare(key, c.keyHash)) {
      req.integrationGymId = c.gymId;
      c.lastUsedAt = new Date();
      await c.save();
      return next();
    }
  }
  return res.status(401).json({ message: 'Invalid API key' });
}
