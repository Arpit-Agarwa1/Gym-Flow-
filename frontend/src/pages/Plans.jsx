import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Modal from '../components/Modal.jsx';

export default function Plans() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    duration: 1,
    price: '',
    joiningFee: 0,
    accessTime: 'All day',
    personalTrainerIncluded: false,
    description: '',
  });

  async function load() {
    const { data } = await api.get('/plans');
    setRows(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e) {
    e.preventDefault();
    await api.post('/plans', {
      ...form,
      duration: Number(form.duration),
      price: Number(form.price),
      joiningFee: Number(form.joiningFee),
    });
    setOpen(false);
    load();
  }

  async function remove(id) {
    if (!confirm('Delete plan?')) return;
    await api.delete(`/plans/${id}`);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Membership plans</h1>
          <p className="text-sm text-gray-400">Pricing & duration templates.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-black"
        >
          New plan
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-charcoal">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Months</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">PT</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p._id} className="border-b border-white/5">
                <td className="px-4 py-3 text-white">{p.name}</td>
                <td className="px-4 py-3 text-gray-400">{p.duration}</td>
                <td className="px-4 py-3 text-gray-300">₹{p.price}</td>
                <td className="px-4 py-3 text-gray-400">
                  {p.personalTrainerIncluded ? 'Yes' : 'No'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-xs text-red-400 hover:underline"
                    onClick={() => remove(p._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} title="Create plan" onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={save}>
          <input
            className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
            type="number"
            placeholder="Duration (months)"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />
          <input
            className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.personalTrainerIncluded}
              onChange={(e) =>
                setForm({ ...form, personalTrainerIncluded: e.target.checked })
              }
            />
            Personal trainer included
          </label>
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
