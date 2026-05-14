import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerThunk } from '../../store/slices/authSlice.js';
import api from '../../api/axios.js';

/** Sign-up: picks gym from public list, defaults to Member role */
export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((s) => s.auth.loading);
  const err = useSelector((s) => s.auth.error);
  const [gyms, setGyms] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gymId: '',
  });

  useEffect(() => {
    api.get('/public/gyms').then((r) => {
      setGyms(r.data);
      if (r.data[0]?._id) {
        setForm((f) => ({ ...f, gymId: r.data[0]._id }));
      }
    });
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    const res = await dispatch(
      registerThunk({
        ...form,
        role: 'Member',
      })
    );
    if (!res.error) navigate('/app');
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gf-canvas px-4 py-10 dark:bg-ink">
      <Link
        to="/"
        className="mb-6 text-sm text-slate-600 transition hover:text-emerald-700 dark:text-gray-400 dark:hover:text-neon"
      >
        ← Back to GymFlow home
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-900/10 dark:border-white/10 dark:bg-charcoal dark:shadow-2xl dark:shadow-black/40">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create member account</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">
          Join a gym workspace (demo gyms appear after seed).
        </p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-xs text-slate-600 dark:text-gray-400">Full name</label>
            <input
              className="gf-field mt-1 w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-gray-400">Email</label>
            <input
              className="gf-field mt-1 w-full"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-gray-400">Password</label>
            <input
              className="gf-field mt-1 w-full"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-gray-400">Phone</label>
            <input
              className="gf-field mt-1 w-full"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-gray-400">Gym</label>
            <select
              className="gf-field mt-1 w-full"
              value={form.gymId}
              onChange={(e) => setForm({ ...form, gymId: e.target.value })}
              required
            >
              {gyms.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          {err && <p className="text-sm text-red-400">{err}</p>}
          <button
            type="submit"
            disabled={loading || !form.gymId}
            className="w-full rounded-lg bg-neon py-2.5 text-sm font-semibold text-black hover:bg-neonDim disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link className="text-neon hover:underline" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
