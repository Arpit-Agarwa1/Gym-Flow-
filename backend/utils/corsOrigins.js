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

/** True when API should accept any https://*.vercel.app origin (preview deploys). */
function allowVercelAppOrigins() {
  const v = process.env.CORS_ALLOW_VERCEL_APP;
  return v === 'true' || v === '1';
}

/**
 * Vercel preview / production hostnames under vercel.app (OAuth callbacks, git branch URLs).
 * @param {string | undefined} origin
 */
function isVercelAppOrigin(origin) {
  if (!origin || typeof origin !== 'string') return false;
  return /^https:\/\/[^/]+\.vercel\.app$/i.test(origin.trim());
}

/**
 * Express `cors` origin callback: allows dev, non-browser requests, and listed origins.
 */
export function createCorsOriginCallback() {
  const allowed = parseAllowedOrigins();
  const isDev = process.env.NODE_ENV !== 'production';
  const vercelPreviews = allowVercelAppOrigins();

  return function corsOrigin(origin, callback) {
    if (isDev) return callback(null, true);
    if (!origin) return callback(null, true);
    if (vercelPreviews && isVercelAppOrigin(origin)) return callback(null, true);
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

/**
 * Socket.IO `cors.origin`: permissive in dev; optional `*.vercel.app` when CORS_ALLOW_VERCEL_APP is set.
 */
export function socketIoCorsOrigin() {
  if (process.env.NODE_ENV === 'development') return true;
  const allowed = parseAllowedOrigins();
  const vercelPreviews = allowVercelAppOrigins();

  if (!vercelPreviews && allowed.length === 0) return true;

  return (origin, callback) => {
    if (!origin) return callback(null, true);
    if (vercelPreviews && isVercelAppOrigin(origin)) return callback(null, true);
    if (allowed.includes(origin)) return callback(null, true);
    return callback(null, false);
  };
}
