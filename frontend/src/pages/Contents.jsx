import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

const categories = [
  'announcement',
  'policy',
  'workout',
  'nutrition',
  'general',
];

/**
 * Gym content library — announcements and snippets for staff (light CMS).
 */
export default function Contents() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    title: '',
    body: '',
    category: 'general',
    pinned: false,
    published: true,
  });

  async function load() {
    const { data } = await api.get('/contents');
    setRows(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    try {
      await api.post('/contents', form);
      setForm({
        title: '',
        body: '',
        category: 'general',
        pinned: false,
        published: true,
      });
      toast.success('Content saved');
      load();
    } catch {
      toast.error('Save failed');
    }
  }

  async function remove(id) {
    if (!confirm('Delete this item?')) return;
    await api.delete(`/contents/${id}`);
    toast.success('Deleted');
    load();
  }

  async function togglePin(row) {
    await api.patch(`/contents/${row._id}`, { pinned: !row.pinned });
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Contents</h1>
        <p className="text-sm text-gray-400">
          Internal notices and reusable copy — not member login content.
        </p>
      </div>

      <form
        onSubmit={add}
        className="space-y-3 rounded-2xl border border-white/10 bg-charcoal p-4"
      >
        <input
          className="gf-field w-full"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          className="gf-field w-full"
          placeholder="Body"
          rows={4}
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          required
        />
        <div className="flex flex-wrap gap-3">
          <select
            className="gf-field"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
            />
            Pinned
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm({ ...form, published: e.target.checked })
              }
            />
            Published
          </label>
          <button
            type="submit"
            className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-ink"
          >
            Add content
          </button>
        </div>
      </form>

      <ul className="space-y-3">
        {rows.map((r) => (
          <li
            key={r._id}
            className="rounded-xl border border-white/10 bg-ink/40 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-white">{r.title}</p>
                <p className="text-xs uppercase text-gray-500">{r.category}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => togglePin(r)}
                  className="text-xs text-neon hover:underline"
                >
                  {r.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  type="button"
                  onClick={() => remove(r._id)}
                  className="text-xs text-red-300 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-300">
              {r.body}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
