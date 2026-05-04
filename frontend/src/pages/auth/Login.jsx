import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk } from '../../store/slices/authSlice.js';

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 py-8">
      <Link
        to="/"
        className="mb-6 text-sm text-gray-500 transition hover:text-neon"
      >
        ← Back to GymFlow home
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-charcoal p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-400">
          Sign in to your gym dashboard.
        </p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-xs text-gray-400">Email</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Password</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm text-white"
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
          <Link to="/forgot-password" className="text-gray-400 hover:text-white">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
