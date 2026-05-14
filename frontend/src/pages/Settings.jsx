import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios.js';

export default function Settings() {
  const user = useSelector((s) => s.auth.user);
  const [gyms, setGyms] = useState([]);
  const [gymForm, setGymForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  const [staff, setStaff] = useState({
    email: '',
    password: 'password123',
    name: '',
    role: 'Staff',
    gymId: '',
  });

  useEffect(() => {
    api
      .get('/gyms')
      .then((r) => {
        setGyms(r.data);
        if (r.data[0]) setStaff((s) => ({ ...s, gymId: r.data[0]._id }));
      })
      .catch(() => {});
  }, []);

  async function saveGym(e) {
    e.preventDefault();
    if (!gyms[0]) return;
    await api.patch(`/gyms/${gyms[0]._id}`, gymForm);
    alert('Gym profile updated');
  }

  async function inviteStaff(e) {
    e.preventDefault();
    await api.post('/auth/register', {
      name: staff.name,
      email: staff.email,
      password: staff.password,
      role: staff.role,
      gymId: staff.gymId,
    });
    alert('Staff user created (they can login with that email)');
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-400">
          Gym profile & staff onboarding (manager/owner).
        </p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-charcoal p-6">
        <h2 className="text-lg font-semibold text-white">Your account</h2>
        <p className="mt-2 text-sm text-gray-400">
          {user?.name} · {user?.role}
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-charcoal p-6">
        <h2 className="text-lg font-semibold text-white">Gym details</h2>
        <form className="mt-4 space-y-3" onSubmit={saveGym}>
          <input
            className="gf-field w-full"
            placeholder="Name"
            value={gymForm.name}
            onChange={(e) => setGymForm({ ...gymForm, name: e.target.value })}
          />
          <input
            className="gf-field w-full"
            placeholder="Address"
            value={gymForm.address}
            onChange={(e) =>
              setGymForm({ ...gymForm, address: e.target.value })
            }
          />
          <input
            className="gf-field w-full"
            placeholder="Phone"
            value={gymForm.phone}
            onChange={(e) => setGymForm({ ...gymForm, phone: e.target.value })}
          />
          <input
            className="gf-field w-full"
            placeholder="Email"
            value={gymForm.email}
            onChange={(e) => setGymForm({ ...gymForm, email: e.target.value })}
          />
          <button
            type="submit"
            className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-ink"
          >
            Save gym
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-white/10 bg-charcoal p-6">
        <h2 className="text-lg font-semibold text-white">Staff management</h2>
        <p className="mt-1 text-xs text-gray-500">
          Creates a login via register endpoint. You will be logged out — log back
          in as owner.
        </p>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={inviteStaff}>
          <input
            className="gf-field md:col-span-2"
            placeholder="Staff name"
            value={staff.name}
            onChange={(e) => setStaff({ ...staff, name: e.target.value })}
            required
          />
          <input
            className="gf-field md:col-span-2"
            placeholder="Staff email"
            type="email"
            value={staff.email}
            onChange={(e) => setStaff({ ...staff, email: e.target.value })}
            required
          />
          <input
            className="gf-field md:col-span-2"
            placeholder="Temp password"
            type="password"
            value={staff.password}
            onChange={(e) => setStaff({ ...staff, password: e.target.value })}
            required
          />
          <select
            className="gf-field"
            value={staff.role}
            onChange={(e) => setStaff({ ...staff, role: e.target.value })}
          >
            <option value="Staff">Staff</option>
            <option value="Trainer">Trainer</option>
            <option value="Manager">Manager</option>
          </select>
          <select
            className="gf-field"
            value={staff.gymId}
            onChange={(e) => setStaff({ ...staff, gymId: e.target.value })}
          >
            {gyms.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="md:col-span-2 rounded-lg bg-neon py-2 text-sm font-semibold text-ink"
          >
            Create staff user
          </button>
        </form>
      </section>
    </div>
  );
}
