import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

const categories = [
  'rent',
  'utilities',
  'equipment',
  'marketing',
  'payroll',
  'supplies',
  'other',
];

/**
 * Operating expenses ledger (Gymshim-style expense module).
 */
export default function Expenses() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    amount: '',
    category: 'other',
    note: '',
    incurredAt: new Date().toISOString().slice(0, 10),
  });

  async function load() {
    const { data } = await api.get('/expenses');
    setRows(data);
  }

  useEffect(() => {
    load();
  }, []);

  const total = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.amount) || 0), 0),
    [rows]
  );

  async function add(e) {
    e.preventDefault();
    try {
      await api.post('/expenses', {
        amount: Number(form.amount),
        category: form.category,
        note: form.note,
        incurredAt: form.incurredAt
          ? new Date(form.incurredAt).toISOString()
          : undefined,
      });
      setForm({
        amount: '',
        category: 'other',
        note: '',
        incurredAt: new Date().toISOString().slice(0, 10),
      });
      toast.success('Expense recorded');
      load();
    } catch {
      toast.error('Could not save expense');
    }
  }

  async function remove(id) {
    if (!confirm('Delete this expense?')) return;
    await api.delete(`/expenses/${id}`);
    toast.success('Removed');
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Expenses</h1>
        <p className="text-sm text-gray-400">
          Track cash outflows by category — complements revenue in Reports.
        </p>
      </div>

      <form
        onSubmit={add}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-charcoal p-4"
      >
        <div>
          <label className="mb-1 block text-xs text-gray-500">Amount (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm text-white"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Category</label>
          <select
            className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm text-white"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Date</label>
          <input
            type="date"
            className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm text-white"
            value={form.incurredAt}
            onChange={(e) => setForm({ ...form, incurredAt: e.target.value })}
          />
        </div>
        <input
          className="min-w-[160px] flex-1 rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm text-white"
          placeholder="Note"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
        <button
          type="submit"
          className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-black"
        >
          Add
        </button>
      </form>

      <div className="rounded-xl border border-white/10 bg-ink/50 px-4 py-3 text-sm">
        <span className="text-gray-400">Listed total: </span>
        <span className="font-semibold text-white">₹{total.toFixed(2)}</span>
        <span className="text-gray-600"> ({rows.length} rows)</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-charcoal">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-ink/60 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-b border-white/5">
                <td className="px-4 py-3 text-gray-400">
                  {new Date(r.incurredAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-gray-300">{r.category}</td>
                <td className="px-4 py-3 font-medium text-white">
                  ₹{Number(r.amount).toFixed(2)}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-gray-500">
                  {r.note}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => remove(r._id)}
                    className="text-xs text-red-300 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
