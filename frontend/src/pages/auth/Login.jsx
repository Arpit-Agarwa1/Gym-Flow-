import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk } from '../../store/slices/authSlice.js';
import ThemeToggle from '../../components/ThemeToggle.jsx';

/** Sign-in screen */
export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((s) => s.auth.loading);
  const err = useSelector((s) => s.auth.error);
  const [email, setEmail] = useState('owner@example.com');
  const [password, setPassword] = useState('password123');

  async function onSubmit(e) {
    e.preventDefault();
    const res = await dispatch(loginThunk({ email, password }));
    if (!res.error) navigate('/app');
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-8 dark:bg-ink">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Link
        to="/"
        className="mb-6 text-sm text-slate-600 transition hover:text-emerald-700 dark:text-gray-500 dark:hover:text-neon"
      >
        ← Back to GymFlow home
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-900/10 dark:border-white/10 dark:bg-charcoal dark:shadow-2xl dark:shadow-black/40">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">
          Sign in to your gym dashboard.
        </p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-xs text-slate-600 dark:text-gray-400">Email</label>
            <input
              className="gf-field mt-1 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-gray-400">Password</label>
            <input
              className="gf-field mt-1 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
          {err && <p className="text-sm text-red-400">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-neon py-2.5 text-sm font-semibold text-black hover:bg-neonDim disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
        <div className="mt-6 flex justify-between text-sm">
          <Link to="/register" className="text-neon hover:underline">
            Create account
          </Link>
          <Link to="/forgot-password" className="text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
