import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';

/** Single member detail */
export default function MemberProfile() {
  const { id } = useParams();
  const [m, setM] = useState(null);
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    api.get(`/members/${id}`).then((r) => setM(r.data));
    api.get('/trainers').then((r) => setTrainers(r.data));
  }, [id]);

  async function freeze() {
    await api.patch(`/members/${id}/freeze`, { frozen: true });
    const { data } = await api.get(`/members/${id}`);
    setM(data);
  }

  async function assignTrainer(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    await api.patch(`/members/${id}/trainer`, {
      trainerId: fd.get('trainerId'),
    });
    const { data } = await api.get(`/members/${id}`);
    setM(data);
  }

  if (!m) return <p className="text-gray-400">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link className="text-sm text-neon hover:underline" to="/app/members">
        ← Members
      </Link>
      <div className="rounded-2xl border border-white/10 bg-charcoal p-6">
        <h1 className="text-2xl font-bold text-white">{m.userId?.name}</h1>
        <p className="text-gray-400">{m.userId?.email}</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-gray-500">Plan</dt>
            <dd className="text-white">{m.membershipPlan?.name || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Expiry</dt>
            <dd className="text-white">
              {m.expiryDate
                ? new Date(m.expiryDate).toLocaleDateString()
                : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">BMI</dt>
            <dd className="text-white">{m.bmi ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Frozen</dt>
            <dd className="text-white">{m.frozen ? 'Yes' : 'No'}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={freeze}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-gray-200"
          >
            Freeze membership
          </button>
        </div>
      </div>

      <form
        onSubmit={assignTrainer}
        className="rounded-2xl border border-white/10 bg-charcoal p-6"
      >
        <h2 className="text-lg font-semibold text-white">Assign trainer</h2>
        <div className="mt-4 flex gap-3">
          <select
            name="trainerId"
            className="gf-field flex-1"
            defaultValue={m.assignedTrainerId?._id || ''}
          >
            <option value="">Select trainer</option>
            {trainers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-ink"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
