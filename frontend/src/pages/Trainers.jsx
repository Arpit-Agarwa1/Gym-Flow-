import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Modal from '../components/Modal.jsx';

export default function Trainers() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    expertise: '',
    salary: '',
    experienceYears: '',
  });

  async function load() {
    const { data } = await api.get('/trainers');
    setRows(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    await api.post('/trainers', {
      name: form.name,
      salary: Number(form.salary) || 0,
      experienceYears: Number(form.experienceYears) || 0,
      expertise: form.expertise
        ? form.expertise.split(',').map((s) => s.trim())
        : [],
    });
    setOpen(false);
    setForm({ name: '', expertise: '', salary: '', experienceYears: '' });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Trainers</h1>
          <p className="text-sm text-gray-400">Staff roster & schedules.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-ink"
        >
          Add trainer
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((t) => (
          <div
            key={t._id}
            className="rounded-2xl border border-white/10 bg-charcoal p-5"
          >
            <h2 className="text-lg font-semibold text-white">{t.name}</h2>
            <p className="text-sm text-gray-400">
              {(t.expertise || []).join(', ') || '—'}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Exp: {t.experienceYears} yrs · Salary: ₹{t.salary}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Assigned members: {t.assignedMembers?.length || 0}
            </p>
          </div>
        ))}
      </div>

      <Modal open={open} title="New trainer" onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={create}>
          <input
            className="gf-field w-full"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="gf-field w-full"
            placeholder="Expertise (comma separated)"
            value={form.expertise}
            onChange={(e) => setForm({ ...form, expertise: e.target.value })}
          />
          <input
            className="gf-field w-full"
            placeholder="Salary"
            type="number"
            value={form.salary}
            onChange={(e) => setForm({ ...form, salary: e.target.value })}
          />
          <input
            className="gf-field w-full"
            placeholder="Years experience"
            type="number"
            value={form.experienceYears}
            onChange={(e) =>
              setForm({ ...form, experienceYears: e.target.value })
            }
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-neon py-2 text-sm font-semibold text-ink"
          >
            Save
          </button>
        </form>
      </Modal>
    </div>
  );
}
