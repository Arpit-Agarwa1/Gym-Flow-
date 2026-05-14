import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function Classes() {
  const [rows, setRows] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    trainer: '',
    capacity: 20,
    day: 'Monday',
    startTime: '07:00',
    endTime: '08:00',
  });

  async function load() {
    const { data } = await api.get('/classes');
    setRows(data);
  }

  useEffect(() => {
    load();
    api.get('/trainers').then((r) => setTrainers(r.data));
    api.get('/members').then((r) => setMembers(r.data));
  }, []);

  async function create(e) {
    e.preventDefault();
    await api.post('/classes', {
      name: form.name,
      trainer: form.trainer,
      capacity: Number(form.capacity),
      schedule: {
        day: form.day,
        startTime: form.startTime,
        endTime: form.endTime,
      },
    });
    load();
  }

  async function book(classId, memberId) {
    await api.post(`/classes/${classId}/book`, { memberId });
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Class schedule</h1>
        <p className="text-sm text-gray-400">Capacity & bookings.</p>
      </div>

      <form
        onSubmit={create}
        className="grid gap-3 rounded-2xl border border-white/10 bg-charcoal p-5 md:grid-cols-3"
      >
        <input
          className="gf-field md:col-span-3"
          placeholder="Class name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <select
          className="gf-field md:col-span-3"
          value={form.trainer}
          onChange={(e) => setForm({ ...form, trainer: e.target.value })}
          required
        >
          <option value="">Trainer</option>
          {trainers.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="gf-field"
          placeholder="Capacity"
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
        />
        <input
          className="gf-field"
          placeholder="Day"
          value={form.day}
          onChange={(e) => setForm({ ...form, day: e.target.value })}
        />
        <input
          className="gf-field"
          placeholder="Start"
          value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
        />
        <input
          className="gf-field md:col-span-3"
          placeholder="End"
          value={form.endTime}
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
        />
        <button
          type="submit"
          className="md:col-span-3 rounded-lg bg-neon py-2 text-sm font-semibold text-ink"
        >
          Create class
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((c) => (
          <div
            key={c._id}
            className="rounded-2xl border border-white/10 bg-charcoal p-5"
          >
            <h2 className="text-lg font-semibold text-white">{c.name}</h2>
            <p className="text-sm text-gray-400">
              {c.schedule?.day} {c.schedule?.startTime}-{c.schedule?.endTime}
            </p>
            <p className="text-xs text-gray-500">
              Trainer: {c.trainer?.name} · Booked {c.bookedMembers?.length || 0}/
              {c.capacity}
            </p>
            <div className="mt-3 flex gap-2">
              <select
                id={`m-${c._id}`}
                className="gf-field-compact flex-1"
              >
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.userId?.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="rounded-lg bg-neon/90 px-3 py-1 text-xs font-semibold text-ink"
                onClick={() => {
                  const sel = document.getElementById(`m-${c._id}`);
                  book(c._id, sel.value);
                }}
              >
                Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
