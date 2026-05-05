/**
 * Parses `CLIENT_URL` for production CORS — comma- or space-separated origins.
 * Example: https://my-app.vercel.app,https://my-app-git-main-user.vercel.app
 * @returns {string[]}
 */
export function parseAllowedOrigins() {
  const raw = process.env.CLIENT_URL || '';
  return raw
    .split(/[,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Express `cors` origin callback: allows dev, non-browser requests, and listed origins.
 */
export function createCorsOriginCallback() {
  const allowed = parseAllowedOrigins();
  const isDev = process.env.NODE_ENV !== 'production';

  return function corsOrigin(origin, callback) {
    if (isDev) return callback(null, true);
    if (!origin) return callback(null, true);
    if (allowed.length === 0) {
      console.warn(
        '[GymFlow] CLIENT_URL is empty — reflecting browser origin (set CLIENT_URL to your Vercel URL for stricter CORS).'
      );
      return callback(null, true);
    }
    if (allowed.includes(origin)) return callback(null, true);
    console.warn(`[GymFlow] CORS blocked origin: ${origin}`);
    return callback(null, false);
  };
}

/** Socket.IO `cors.origin`: array in prod when CLIENT_URL set, else permissive. */
export function socketIoCorsOrigin() {
  if (process.env.NODE_ENV === 'development') return true;
  const allowed = parseAllowedOrigins();
  if (allowed.length === 0) return true;
  return allowed;
}
