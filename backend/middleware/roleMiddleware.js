import { ROLES } from '../models/User.js';

/**
 * Allows route only if req.user.role is in allowedRoles.
 */
export function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden for this role' });
    }
    next();
  };
}

/** Staff-level and above (not Member-only views) */
export const staffRoles = [
  ROLES.SUPER_ADMIN,
  ROLES.GYM_OWNER,
  ROLES.MANAGER,
  ROLES.TRAINER,
  ROLES.STAFF,
];

export const managerRoles = [
  ROLES.SUPER_ADMIN,
  ROLES.GYM_OWNER,
  ROLES.MANAGER,
];

export const ownerRoles = [ROLES.SUPER_ADMIN, ROLES.GYM_OWNER];
