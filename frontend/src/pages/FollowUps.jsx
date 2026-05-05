import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

/**
 * Follow-up queue for enquiries (leads with next follow-up dates).
 */
export default function FollowUps() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leads');
      setRows(data);
    } catch (e) {
      toast.error('Could not load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveFollowUp(id, nextFollowUpAt, lastFollowUpNotes) {
    try {
      await api.patch(`/leads/${id}`, {
        nextFollowUpAt: nextFollowUpAt || null,
        lastFollowUpNotes: lastFollowUpNotes ?? '',
      });
      toast.success('Follow-up saved');
      load();
    } catch {
      toast.error('Update failed');
    }
  }

  const now = Date.now();
  const openLeads = rows.filter((l) => !['won', 'lost'].includes(l.status));
  const due = openLeads.filter(
    (l) => l.nextFollowUpAt && new Date(l.nextFollowUpAt).getTime() <= now
  );
  const upcoming = openLeads.filter(
    (l) => l.nextFollowUpAt && new Date(l.nextFollowUpAt).getTime() > now
  );
  const noDate = openLeads.filter((l) => !l.nextFollowUpAt);

  if (loading) {
    return <p className="text-gray-400">Loading follow-ups…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Follow up</h1>
        <p className="text-sm text-gray-400">
          Track enquiry callbacks — aligned with a CRM follow-up column.
        </p>
      </div>

      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-200">
          Due & overdue ({due.length})
        </h2>
        <LeadFollowTable leads={due} onSave={saveFollowUp} />
      </section>

      <section className="rounded-2xl border border-white/10 bg-charcoal p-4">
        <h2 className="mb-3 text-sm font-semibold text-neon">Scheduled</h2>
        <LeadFollowTable leads={upcoming} onSave={saveFollowUp} />
      </section>

      <section className="rounded-2xl border border-white/10 bg-charcoal p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-400">
          No date set ({noDate.length})
        </h2>
        <LeadFollowTable leads={noDate} onSave={saveFollowUp} />
      </section>
    </div>
  );
}

function LeadFollowTable({ leads, onSave }) {
  if (leads.length === 0) {
    return <p className="text-sm text-gray-500">Nothing here.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/10 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-2 py-2">Name</th>
            <th className="px-2 py-2">Phone</th>
            <th className="px-2 py-2">Status</th>
            <th className="px-2 py-2">Next follow-up</th>
            <th className="px-2 py-2">Notes</th>
            <th className="px-2 py-2" />
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <FollowRow key={l._id} lead={l} onSave={onSave} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FollowRow({ lead, onSave }) {
  const [next, setNext] = useState(
    lead.nextFollowUpAt
      ? new Date(lead.nextFollowUpAt).toISOString().slice(0, 16)
      : ''
  );
  const [notes, setNotes] = useState(lead.lastFollowUpNotes || '');

  return (
    <tr className="border-b border-white/5">
      <td className="px-2 py-2 font-medium text-white">{lead.name}</td>
      <td className="px-2 py-2 text-gray-400">{lead.phone}</td>
      <td className="px-2 py-2 text-xs uppercase text-gray-500">{lead.status}</td>
      <td className="px-2 py-2">
        <input
          type="datetime-local"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className="rounded border border-white/10 bg-ink px-2 py-1 text-xs text-white"
        />
      </td>
      <td className="max-w-[200px] px-2 py-2">
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Last call outcome…"
          className="w-full rounded border border-white/10 bg-ink px-2 py-1 text-xs text-white"
        />
      </td>
      <td className="px-2 py-2">
        <button
          type="button"
          onClick={() =>
            onSave(lead._id, next ? new Date(next).toISOString() : null, notes)
          }
          className="rounded bg-neon/20 px-2 py-1 text-xs font-semibold text-neon"
        >
          Save
        </button>
      </td>
    </tr>
  );
}
