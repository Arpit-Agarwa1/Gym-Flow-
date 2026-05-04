import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function EquipmentPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    name: '',
    warranty: '',
    condition: 'good',
  });

  async function load() {
    const { data } = await api.get('/equipment');
    setRows(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e) {
    e.preventDefault();
    await api.post('/equipment', {
      ...form,
      purchaseDate: new Date(),
      maintenanceDate: null,
    });
    setForm({ name: '', warranty: '', condition: 'good' });
    load();
  }

  async function logMaintenance(id) {
    await api.patch(`/equipment/${id}`, {
      maintenanceDate: new Date(),
      condition: 'good',
    });
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Equipment</h1>
        <p className="text-sm text-gray-400">Assets & maintenance dates.</p>
      </div>

      <form
        onSubmit={save}
        className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-charcoal p-5"
      >
        <input
          className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
          placeholder="Warranty note"
          value={form.warranty}
          onChange={(e) => setForm({ ...form, warranty: e.target.value })}
        />
        <select
          className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
          value={form.condition}
          onChange={(e) => setForm({ ...form, condition: e.target.value })}
        >
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="needs_service">Needs service</option>
          <option value="retired">Retired</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-black"
        >
          Add
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-charcoal">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Condition</th>
              <th className="px-4 py-3">Last service</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((eq) => (
              <tr key={eq._id} className="border-b border-white/5">
                <td className="px-4 py-3 text-white">{eq.name}</td>
                <td className="px-4 py-3 text-gray-400">{eq.condition}</td>
                <td className="px-4 py-3 text-gray-400">
                  {eq.maintenanceDate
                    ? new Date(eq.maintenanceDate).toLocaleDateString()
                    : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-xs text-neon hover:underline"
                    onClick={() => logMaintenance(eq._id)}
                  >
                    Log service
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
