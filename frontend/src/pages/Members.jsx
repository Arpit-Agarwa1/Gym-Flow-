import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios.js';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';

/** Member directory + quick add */
export default function Members() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'changeme123',
    phone: '',
    membershipPlanId: '',
    referredByCode: '',
  });

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/members');
      setRows(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    api.get('/plans').then((r) => setPlans(r.data));
  }, []);

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      setOpen(true);
      searchParams.delete('add');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  async function addMember(e) {
    e.preventDefault();
    await api.post('/members', {
      ...form,
      membershipPlanId: form.membershipPlanId || undefined,
      referredByCode: form.referredByCode?.trim() || undefined,
    });
    setOpen(false);
    setForm({
      name: '',
      email: '',
      password: 'changeme123',
      phone: '',
      membershipPlanId: '',
      referredByCode: '',
    });
    load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        subtitle="Profiles, renewals, and trainer assignments — click a row for full detail."
        actions={
          <button type="button" onClick={() => setOpen(true)} className="btn-primary">
            Add member
          </button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-ink/25 shadow-panel-sm ring-1 ring-white/[0.04]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-ink/60 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Expiry</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-6 text-gray-400" colSpan={5}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((m) => (
                <tr key={m._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white">
                    {m.userId?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {m.userId?.email}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {m.membershipPlan?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {m.expiryDate
                      ? new Date(m.expiryDate).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      className="text-neon hover:underline"
                      to={`/app/members/${m._id}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} title="Add member" onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={addMember}>
          <input
            className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <input
            className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <select
            className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
            value={form.membershipPlanId}
            onChange={(e) =>
              setForm({ ...form, membershipPlanId: e.target.value })
            }
          >
            <option value="">Plan (optional)</option>
            {plans.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
            placeholder="Referral code (optional)"
            value={form.referredByCode}
            onChange={(e) =>
              setForm({ ...form, referredByCode: e.target.value })
            }
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-neon py-2 text-sm font-semibold text-black"
          >
            Save
          </button>
        </form>
      </Modal>
    </div>
  );
}
