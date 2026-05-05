import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

/**
 * Training & nutrition planners hub + recurring subscriptions (manager APIs).
 */
export default function Planners() {
  const [subs, setSubs] = useState([]);
  const [subsErr, setSubsErr] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/platform/subscriptions');
        setSubs(data);
        setSubsErr(null);
      } catch (e) {
        setSubs([]);
        setSubsErr(
          e.response?.status === 403
            ? 'Subscriptions list needs Owner / Manager role.'
            : 'Could not load subscriptions.'
        );
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Planners</h1>
        <p className="text-sm text-gray-400">
          Jump to workout and diet builders; managers see billing subscriptions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          to="/app/workouts"
          className="rounded-2xl border border-white/10 bg-charcoal p-5 transition hover:border-neon/40"
        >
          <p className="text-sm font-semibold text-white">Workout plans</p>
          <p className="mt-1 text-xs text-gray-500">Templates & assignments</p>
        </Link>
        <Link
          to="/app/diets"
          className="rounded-2xl border border-white/10 bg-charcoal p-5 transition hover:border-neon/40"
        >
          <p className="text-sm font-semibold text-white">Nutrition / diets</p>
          <p className="mt-1 text-xs text-gray-500">Meal plans for members</p>
        </Link>
        <Link
          to="/app/classes"
          className="rounded-2xl border border-white/10 bg-charcoal p-5 transition hover:border-neon/40"
        >
          <p className="text-sm font-semibold text-white">Classes</p>
          <p className="mt-1 text-xs text-gray-500">Schedule & bookings</p>
        </Link>
      </div>

      <section className="rounded-2xl border border-white/10 bg-charcoal p-4">
        <h2 className="mb-3 text-sm font-semibold text-neon">
          Recurring subscriptions
        </h2>
        {subsErr && <p className="text-sm text-amber-200/90">{subsErr}</p>}
        {!subsErr && subs.length === 0 && (
          <p className="text-sm text-gray-500">No subscription rows yet.</p>
        )}
        {!subsErr && subs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-2 py-2">Member</th>
                  <th className="px-2 py-2">Plan</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Period end</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s._id} className="border-b border-white/5">
                    <td className="px-2 py-2 text-white">
                      {s.memberId?.userId?.name ?? '—'}
                    </td>
                    <td className="px-2 py-2 text-gray-400">
                      {s.membershipPlanId?.name ?? '—'}
                    </td>
                    <td className="px-2 py-2 text-xs uppercase text-gray-500">
                      {s.status}
                    </td>
                    <td className="px-2 py-2 text-gray-500">
                      {s.currentPeriodEnd
                        ? new Date(s.currentPeriodEnd).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-gray-600">
          Create or edit subscriptions under Advanced ops → Subscriptions.
        </p>
      </section>
    </div>
  );
}
