import axios from 'axios';

/**
 * Token provider — set from main.jsx with `setAuthTokenGetter` so every request
 * carries `Authorization` without relying on effect order (avoids 401 races).
 * Avoids importing the Redux store here (store → authSlice → this module = cycle).
 */
let getAuthToken = () => null;

/**
 * @param {() => string | null | undefined} getter Returns JWT or null
 */
export function setAuthTokenGetter(getter) {
  getAuthToken = typeof getter === 'function' ? getter : () => null;
}

/**
 * Resolves Axios base URL. Dev uses Vite proxy `/api` → local backend.
 * Production must set `VITE_API_URL` (e.g. on Vercel) to your public API,
 * e.g. `https://your-api.example.com/api`. HTTPS sites cannot call localhost;
 * the browser blocks it (Private Network Access / loopback).
 */
function resolveBaseURL() {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

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

export default api;
