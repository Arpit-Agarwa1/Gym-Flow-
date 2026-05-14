import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import ThemeToggle from '../../components/ThemeToggle.jsx';

/** Requests reset token — dev mode shows token in API response */
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [token, setToken] = useState('');
  const [pw, setPw] = useState('');
  const [step, setStep] = useState(1);

  async function requestReset(e) {
    e.preventDefault();
    setMsg('');
    const { data } = await api.post('/auth/forgot-password', { email });
    setMsg(data.message);
    if (data.devResetToken) setToken(data.devResetToken);
    setStep(2);
  }

  async function submitNewPassword(e) {
    e.preventDefault();
    await api.post('/auth/reset-password', { token, password: pw });
    setMsg('Password updated. You can login now.');
    setStep(3);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-8 dark:bg-ink">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Link
        to="/"
        className="mb-6 text-sm text-slate-600 transition hover:text-charcoal dark:text-cream/70 dark:hover:text-neon"
      >
        ← Back to GymFlow home
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-8 shadow-lg dark:border-white/10 dark:bg-charcoal">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Reset password</h1>
        {step === 1 && (
          <form className="mt-6 space-y-4" onSubmit={requestReset}>
            <input
              className="gf-field w-full"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-neon py-2 text-sm font-semibold text-ink"
            >
              Send reset link
            </button>
          </form>
        )}
        {step === 2 && (
          <form className="mt-6 space-y-4" onSubmit={submitNewPassword}>
            <p className="text-xs text-slate-600 dark:text-gray-400">{msg}</p>
            {token && (
              <p className="text-xs text-charcoal dark:text-neon">
                Dev token (paste below):{' '}
                <span className="break-all text-slate-700 dark:text-gray-200">{token}</span>
              </p>
            )}
            <input
              className="gf-field w-full"
              placeholder="Reset token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <input
              className="gf-field w-full"
              placeholder="New password"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-neon py-2 text-sm font-semibold text-ink"
            >
              Update password
            </button>
          </form>
        )}
        {step === 3 && <p className="mt-4 text-sm text-slate-700 dark:text-gray-300">{msg}</p>}
        <Link className="mt-6 inline-block text-sm text-neon" to="/login">
          ← Back to login
        </Link>
      </div>
    </div>
  );
}
