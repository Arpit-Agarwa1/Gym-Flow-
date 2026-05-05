import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';

const columns = ['new', 'contacted', 'trial', 'won', 'lost'];

export default function Leads() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    source: 'website',
    notes: '',
    nextFollowUpAt: '',
    lastFollowUpNotes: '',
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
    await api.post('/leads', {
      ...form,
      nextFollowUpAt: form.nextFollowUpAt
        ? new Date(form.nextFollowUpAt).toISOString()
        : undefined,
    });
    setForm({
      name: '',
      phone: '',
      source: 'website',
      notes: '',
      nextFollowUpAt: '',
      lastFollowUpNotes: '',
    });
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
      <PageHeader
        title="Lead CRM"
        subtitle="Kanban-style pipeline — drag statuses via buttons; convert won deals into members."
      />

      <form
        onSubmit={add}
        className="flex flex-wrap gap-2 rounded-2xl border border-white/[0.08] bg-ink/30 p-4 shadow-panel-sm ring-1 ring-white/[0.04]"
      >
        <input
          className="input-dark min-w-[120px]"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="input-dark min-w-[120px]"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <input
          className="input-dark min-w-[100px]"
          placeholder="Source"
          value={form.source}
          onChange={(e) => setForm({ ...form, source: e.target.value })}
        />
        <input
          type="datetime-local"
          className="input-dark min-w-[200px]"
          value={form.nextFollowUpAt}
          onChange={(e) =>
            setForm({ ...form, nextFollowUpAt: e.target.value })
          }
        />
        <button type="submit" className="btn-primary">
          Add lead
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-5">
        {columns.map((col) => (
          <div
            key={col}
            className="rounded-xl border border-white/[0.08] bg-ink/25 p-3 shadow-panel-sm ring-1 ring-white/[0.03]"
          >
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
                    {l.nextFollowUpAt && (
                      <p className="mt-1 text-[10px] text-amber-200/90">
                        Follow-up:{' '}
                        {new Date(l.nextFollowUpAt).toLocaleString()}
                      </p>
                    )}
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
