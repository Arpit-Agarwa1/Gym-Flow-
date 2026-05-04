import { useEffect, useState } from 'react';
import api from '../api/axios.js';

const columns = ['new', 'contacted', 'trial', 'won', 'lost'];

export default function Leads() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    source: 'website',
    notes: '',
  });

  async function load() {
    const { data } = await api.get('/leads');
    setRows(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    await api.post('/leads', form);
    setForm({ name: '', phone: '', source: 'website', notes: '' });
    load();
  }

  async function move(id, status) {
    await api.patch(`/leads/${id}`, { status });
    load();
  }

  async function convert(id) {
    await api.post(`/leads/${id}/convert`, {});
    load();
    alert('Lead converted to member (placeholder email used if none).');
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Lead CRM</h1>
        <p className="text-sm text-gray-400">Simple board by status.</p>
      </div>

      <form
        onSubmit={add}
        className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-charcoal p-4"
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
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <input
          className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
          placeholder="Source"
          value={form.source}
          onChange={(e) => setForm({ ...form, source: e.target.value })}
        />
        <button
          type="submit"
          className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-black"
        >
          Add lead
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-5">
        {columns.map((col) => (
          <div key={col} className="rounded-xl border border-white/10 bg-charcoal p-3">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neon">
              {col}
            </h3>
            <div className="space-y-2">
              {rows
                .filter((l) => l.status === col)
                .map((l) => (
                  <div
                    key={l._id}
                    className="rounded-lg border border-white/5 bg-ink/60 p-3 text-xs"
                  >
                    <p className="font-medium text-white">{l.name}</p>
                    <p className="text-gray-500">{l.phone}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {columns
                        .filter((c) => c !== col)
                        .map((c) => (
                          <button
                            key={c}
                            type="button"
                            className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase text-gray-300"
                            onClick={() => move(l._id, c)}
                          >
                            {c}
                          </button>
                        ))}
                      <button
                        type="button"
                        className="rounded bg-neon/20 px-2 py-0.5 text-[10px] font-semibold text-neon"
                        onClick={() => convert(l._id)}
                      >
                        Convert
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
