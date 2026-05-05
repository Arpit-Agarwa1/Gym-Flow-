import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

/**
 * Membership roster view: plan + expiry per member (Gymshim-style “Memberships”).
 */
export default function Memberships() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/members');
        setRows(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function statusFor(m) {
    if (m.frozen) return { label: 'Frozen', cls: 'text-sky-300' };
    if (!m.expiryDate) return { label: 'Open', cls: 'text-gray-400' };
    const exp = new Date(m.expiryDate).getTime();
    if (exp < Date.now()) return { label: 'Expired', cls: 'text-red-300' };
    const days = Math.ceil((exp - Date.now()) / (86400 * 1000));
    if (days <= 7) return { label: `Active (${days}d)`, cls: 'text-amber-300' };
    return { label: 'Active', cls: 'text-emerald-300' };
  }

  if (loading) return <p className="text-gray-400">Loading memberships…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Memberships</h1>
        <p className="text-sm text-gray-400">
          Active plans and expiry dates — drill into a member for full profile.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-charcoal">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-ink/60 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Expiry</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => {
              const st = statusFor(m);
              const name = m.userId?.name ?? '—';
              const planName = m.membershipPlan?.name ?? '—';
              return (
                <tr key={m._id} className="border-b border-white/5">
                  <td className="px-4 py-3 font-medium text-white">{name}</td>
                  <td className="px-4 py-3 text-gray-300">{planName}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {m.joiningDate
                      ? new Date(m.joiningDate).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {m.expiryDate
                      ? new Date(m.expiryDate).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className={`px-4 py-3 text-xs font-semibold ${st.cls}`}>
                    {st.label}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/app/members/${m._id}`}
                      className="text-xs text-neon hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
