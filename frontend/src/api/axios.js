import axios from 'axios';

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

export default api;
