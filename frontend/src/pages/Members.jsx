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

      <div className="gf-table-shell">
        <table className="min-w-full text-left text-sm">
          <thead className="gf-thead">
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
                <td className="gf-td-muted px-4 py-6" colSpan={5}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((m) => (
                <tr key={m._id} className="gf-tr">
                  <td className="gf-td-strong px-4 py-3">
                    {m.userId?.name || '—'}
                  </td>
                  <td className="gf-td-muted px-4 py-3">
                    {m.userId?.email}
                  </td>
                  <td className="gf-td-soft px-4 py-3">
                    {m.membershipPlan?.name || '—'}
                  </td>
                  <td className="gf-td-muted px-4 py-3">
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
            className="gf-field w-full"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="gf-field w-full"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="gf-field w-full"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <input
            className="gf-field w-full"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <select
            className="gf-field w-full"
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
            className="gf-field w-full"
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
