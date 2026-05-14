import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function Workouts() {
  const [rows, setRows] = useState([]);
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [form, setForm] = useState({
    memberId: '',
    trainerId: '',
    workoutPlan: '',
    exercises: 'Squat, Bench, Row',
    sets: 3,
    reps: 10,
  });

  async function load() {
    const { data } = await api.get('/workouts');
    setRows(data);
  }

  useEffect(() => {
    load();
    api.get('/members').then((r) => setMembers(r.data));
    api.get('/trainers').then((r) => setTrainers(r.data));
  }, []);

  async function save(e) {
    e.preventDefault();
    await api.post('/workouts', {
      memberId: form.memberId,
      trainerId: form.trainerId || undefined,
      workoutPlan: form.workoutPlan,
      sets: Number(form.sets),
      reps: Number(form.reps),
      exercises: form.exercises.split(',').map((n) => ({
        name: n.trim(),
      })),
    });
    setForm({
      memberId: '',
      trainerId: '',
      workoutPlan: '',
      exercises: 'Squat, Bench, Row',
      sets: 3,
      reps: 10,
    });
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Workout builder</h1>
        <p className="text-sm text-gray-400">
          Assign sessions and log progress over time.
        </p>
      </div>

      <form
        onSubmit={save}
        className="grid gap-3 rounded-2xl border border-white/10 bg-charcoal p-5 md:grid-cols-2"
      >
        <select
          className="gf-field"
          value={form.memberId}
          onChange={(e) => setForm({ ...form, memberId: e.target.value })}
          required
        >
          <option value="">Member</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.userId?.name}
            </option>
          ))}
        </select>
        <select
          className="gf-field"
          value={form.trainerId}
          onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
        >
          <option value="">Trainer (optional)</option>
          {trainers.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
        <input
          className="gf-field md:col-span-2"
          placeholder="Plan title"
          value={form.workoutPlan}
          onChange={(e) => setForm({ ...form, workoutPlan: e.target.value })}
        />
        <input
          className="gf-field md:col-span-2"
          placeholder="Exercises (comma separated)"
          value={form.exercises}
          onChange={(e) => setForm({ ...form, exercises: e.target.value })}
        />
        <input
          type="number"
          className="gf-field"
          placeholder="Sets"
          value={form.sets}
          onChange={(e) => setForm({ ...form, sets: e.target.value })}
        />
        <input
          type="number"
          className="gf-field"
          placeholder="Reps"
          value={form.reps}
          onChange={(e) => setForm({ ...form, reps: e.target.value })}
        />
        <button
          type="submit"
          className="md:col-span-2 rounded-lg bg-neon py-2 text-sm font-semibold text-black"
        >
          Save workout
        </button>
      </form>

      <div className="space-y-3">
        {rows.map((w) => (
          <div
            key={w._id}
            className="rounded-xl border border-white/10 bg-charcoal p-4"
          >
            <p className="font-semibold text-white">{w.workoutPlan}</p>
            <p className="text-xs text-gray-500">
              {(w.exercises || []).map((e) => e.name).join(', ')}
            </p>
            <p className="text-xs text-gray-400">
              {w.sets}×{w.reps} · Logs: {w.progressLog?.length || 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
