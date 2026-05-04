import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 py-8">
      <Link
        to="/"
        className="mb-6 text-sm text-gray-500 transition hover:text-neon"
      >
        ← Back to GymFlow home
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-charcoal p-8">
        <h1 className="text-xl font-semibold text-white">Reset password</h1>
        {step === 1 && (
          <form className="mt-6 space-y-4" onSubmit={requestReset}>
            <input
              className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-neon py-2 text-sm font-semibold text-black"
            >
              Send reset link
            </button>
          </form>
        )}
        {step === 2 && (
          <form className="mt-6 space-y-4" onSubmit={submitNewPassword}>
            <p className="text-xs text-gray-400">{msg}</p>
            {token && (
              <p className="text-xs text-neon">
                Dev token (paste below):{' '}
                <span className="break-all text-gray-200">{token}</span>
              </p>
            )}
            <input
              className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
              placeholder="Reset token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <input
              className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
              placeholder="New password"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-neon py-2 text-sm font-semibold text-black"
            >
              Update password
            </button>
          </form>
        )}
        {step === 3 && <p className="mt-4 text-sm text-gray-300">{msg}</p>}
        <Link className="mt-6 inline-block text-sm text-neon" to="/login">
          ← Back to login
        </Link>
      </div>
    </div>
  );
}
