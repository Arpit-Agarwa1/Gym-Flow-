import axios from 'axios';

/**
 * Token provider — set from main.jsx with `setAuthTokenGetter` so every request
 * carries `Authorization` without relying on effect order (avoids 401 races).
 * Avoids importing the Redux store here (store → authSlice → this module = cycle).
 */
let getAuthToken = () => null;

/** Clears session + redirects when API returns 401 (bad/expired JWT). Set from main.jsx. */
let onUnauthorized = /** @type {(() => void) | null} */ (null);

/** Coalesce parallel 401s into one handler run */
let handlingUnauthorized = false;

/**
 * @param {() => string | null | undefined} getter Returns JWT or null
 */
export function setAuthTokenGetter(getter) {
  getAuthToken = typeof getter === 'function' ? getter : () => null;
}

/**
 * @param {() => void} handler Dispatched on 401 (except login/register/forgot flows)
 */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = typeof handler === 'function' ? handler : null;
}

/** True when 401 is an expected “wrong password” style response, not a dead session. */
function isAuthFormRequest(config) {
  const u = config?.url || '';
  return (
    u.includes('/auth/login') ||
    u.includes('/auth/register') ||
    u.includes('/auth/forgot-password') ||
    u.includes('/auth/reset-password')
  );
}

/**
 * Express mounts all routes under `/api`. If env is set to origin only
 * (e.g. `https://foo.onrender.com`), requests become `/leads` → 404 instead of `/api/leads`.
 * @param {string} raw
 */
function normalizeConfiguredApiBase(raw) {
  const trimmed = raw.trim().replace(/\/$/, '');
  if (!trimmed.startsWith('http')) {
    return trimmed;
  }
  try {
    const u = new URL(trimmed);
    const path = (u.pathname || '/').replace(/\/$/, '') || '/';
    if (path === '/') {
      const fixed = `${u.origin}/api`;
      console.warn(
        '[GymFlow] VITE_API_URL must include /api — adjusted to',
        fixed,
        '(was origin-only). Update Vercel env to this value to silence this warning.'
      );
      return fixed;
    }
    return trimmed;
  } catch {
    console.warn('[GymFlow] VITE_API_URL is not a valid absolute URL:', raw);
    return trimmed;
  }
}

/**
 * Resolves Axios base URL. Dev uses Vite proxy `/api` → local backend.
 * Production must set `VITE_API_URL` (e.g. on Vercel) to your public API,
 * e.g. `https://your-api.example.com/api`. HTTPS sites cannot call localhost;
 * the browser blocks it (Private Network Access / loopback).
 */
function resolveBaseURL() {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) return normalizeConfiguredApiBase(configured);

  if (import.meta.env.DEV) return '/api';

  console.error(
    '[GymFlow] VITE_API_URL is missing. In Vercel → Settings → Environment Variables, set ' +
      'VITE_API_URL to your deployed backend base including /api (e.g. https://api.example.com/api), ' +
      'then redeploy. On the API server set CLIENT_URL to your frontend origin for CORS.'
  );
  return '/api';
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 25000,
});

// Attach Bearer from Redux on every request (fixes race vs App hydrate useEffect)
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const cfg = error.config;
    if (
      status === 401 &&
      cfg &&
      !isAuthFormRequest(cfg) &&
      typeof onUnauthorized === 'function'
    ) {
      if (!handlingUnauthorized) {
        handlingUnauthorized = true;
        try {
          onUnauthorized();
        } finally {
          queueMicrotask(() => {
            handlingUnauthorized = false;
          });
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
