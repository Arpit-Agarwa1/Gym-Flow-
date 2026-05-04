import { ROLES } from '../models/User.js';

/**
 * Returns gym ObjectId string for list/create queries based on role.
 */
export function resolveGymId(req, bodyGymId) {
  if (req.user.role === ROLES.SUPER_ADMIN) {
    return bodyGymId || req.query.gymId || req.user.gymId;
  }
  return req.user.gymId;
}
