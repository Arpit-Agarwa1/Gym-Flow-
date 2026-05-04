import AuditLog from '../models/AuditLog.js';

/**
 * Persists an immutable audit row for compliance and investigations.
 */
export async function logAudit({
  gymId,
  actorUserId,
  action,
  resource,
  resourceId = '',
  meta = {},
  ip = '',
}) {
  if (!gymId || !action || !resource) return null;
  return AuditLog.create({
    gymId,
    actorUserId,
    action,
    resource,
    resourceId: String(resourceId),
    meta,
    ip,
  });
}
