import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function Diets() {
  const [rows, setRows] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberId, setMemberId] = useState('');
  const [calories, setCalories] = useState(2200);

  async function load() {
    const { data } = await api.get('/diets');
    setRows(data);
  }

  useEffect(() => {
    load();
    api.get('/members').then((r) => setMembers(r.data));
  }, []);

  async function save(e) {
    e.preventDefault();
    await api.post('/diets', {
      memberId,
      calories,
      macros: { protein: 150, carbs: 220, fats: 65 },
      weeklyPlan: [
        { day: 'Monday', meals: ['Oats', 'Chicken rice', 'Greek yogurt'] },
        { day: 'Tuesday', meals: ['Eggs', 'Salad bowl', 'Fish'] },
      ],
    });
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Diet planner</h1>
        <p className="text-sm text-gray-400">Macros + weekly templates.</p>
      </div>

      <form
        onSubmit={save}
        className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-charcoal p-5"
      >
        <select
          className="gf-field"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          required
        >
          <option value="">Member</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.userId?.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="gf-field"
          value={calories}
          onChange={(e) => setCalories(Number(e.target.value))}
        />
        <button
          type="submit"
          className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-ink"
        >
          Save sample plan
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((d) => (
          <div
            key={d._id}
            className="rounded-xl border border-white/10 bg-charcoal p-4 text-sm"
          >
            <p className="font-semibold text-white">
              Member #{String(d.memberId).slice(-6)}
            </p>
            <p className="text-neon">{d.calories} kcal</p>
            <p className="text-xs text-gray-400">
              P {d.macros?.protein} · C {d.macros?.carbs} · F {d.macros?.fats}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
