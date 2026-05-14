import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

/**
 * Email / SMS campaigns — maps to platform campaigns (manager-only API).
 */
export default function Advertisements() {
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/platform/campaigns');
      setCampaigns(data);
      setError(null);
    } catch (e) {
      setCampaigns([]);
      setError(
        e.response?.status === 403
          ? 'Advertisements need Owner or Manager role.'
          : 'Could not load campaigns.'
      );
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.post('/platform/campaigns', {
        name: fd.get('name'),
        channel: fd.get('channel'),
        segment: fd.get('segment'),
        subject: fd.get('subject'),
        body: fd.get('body'),
        status: 'draft',
      });
      toast.success('Campaign saved');
      e.target.reset();
      load();
    } catch {
      toast.error('Save failed — check role / SMTP setup');
    }
  }

  async function send(id) {
    try {
      await api.post(`/platform/campaigns/${id}/send`);
      toast.success('Send finished (see logs / SMTP)');
      load();
    } catch {
      toast.error('Send failed');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Advertisements</h1>
        <p className="text-sm text-gray-400">
          Broadcast campaigns to member segments — requires manager role &
          optional SMTP.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {error}
        </div>
      )}

      {!error && (
        <>
          <form
            onSubmit={add}
            className="grid gap-2 rounded-2xl border border-white/10 bg-charcoal p-4 text-sm md:grid-cols-2"
          >
            <input
              name="name"
              placeholder="Campaign name"
              className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-white"
              required
            />
            <select
              name="channel"
              className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-white"
            >
              <option value="email">Email</option>
              <option value="sms">SMS (logged only)</option>
              <option value="whatsapp">WhatsApp (logged only)</option>
            </select>
            <select
              name="segment"
              className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-white"
            >
              <option value="all_members">All members</option>
              <option value="expiring_7d">Expiring 7d</option>
              <option value="expiring_30d">Expiring 30d</option>
              <option value="dormant_30d">Dormant 30d</option>
              <option value="all_leads">All leads</option>
            </select>
            <input
              name="subject"
              placeholder="Subject (email)"
              className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-white"
            />
            <textarea
              name="body"
              placeholder="Message body"
              rows={3}
              className="md:col-span-2 rounded-lg border border-white/10 bg-ink px-3 py-2 text-white"
              required
            />
            <button
              type="submit"
              className="rounded-lg bg-neon px-4 py-2 font-semibold text-ink md:col-span-2"
            >
              Save draft
            </button>
          </form>

          <ul className="space-y-2 text-sm">
            {campaigns.map((c) => (
              <li
                key={c._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-ink/40 px-4 py-3"
              >
                <span className="text-gray-200">
                  {c.name}{' '}
                  <span className="text-xs text-gray-500">· {c.status}</span>
                </span>
                <button
                  type="button"
                  className="text-xs font-semibold text-neon hover:underline"
                  onClick={() => send(c._id)}
                >
                  Send now
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
