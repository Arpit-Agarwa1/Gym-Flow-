import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';
import InquiryPipelineTable from '../components/InquiryPipelineTable.jsx';
import FollowUpEntriesFields from '../components/FollowUpEntriesFields.jsx';
import { prepareFollowUpEntriesForSave } from '../utils/leadFollowUps.js';

const columns = ['hot', 'warm', 'cold'];

const emptyFollowUps = () => [
  { content: '' },
  { content: '' },
];

/**
 * Prospect gender — stored on `Lead.gender` (legacy `unspecified` may exist in DB).
 * @type {readonly { value: string; label: string }[]}
 */
const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

/**
 * Acquisition source options — `stored` is written to the lead `source` field.
 * @type {readonly { value: string; label: string; stored?: string }[]}
 */
const SOURCE_OPTIONS = [
  { value: 'walk_ins', label: 'Walk-ins', stored: 'Walk-ins' },
  { value: 'member_referral', label: 'Member referral', stored: 'Member referral' },
  { value: 'advertising', label: 'Advertising', stored: 'Advertising' },
  { value: 'other', label: 'Other' },
];

/**
 * Maps UI source selection to the string persisted on the lead `source` field.
 * @param {string} sourceKey
 * @param {string} sourceOther
 */
function resolveSourceForApi(sourceKey, sourceOther) {
  if (sourceKey === 'other') {
    const detail = (sourceOther || '').trim();
    return detail ? `Other: ${detail}` : 'Other';
  }
  const opt = SOURCE_OPTIONS.find((o) => o.value === sourceKey);
  return opt?.stored ?? 'Walk-ins';
}

export default function Leads() {
  const [rows, setRows] = useState([]);
  /** Trainers in this gym — for optional inquiry assignment */
  const [trainers, setTrainers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    gender: '',
    handledBy: '',
    assignedTrainerId: '',
    source: 'walk_ins',
    sourceOther: '',
    referralMemberName: '',
    notes: '',
    nextFollowUpAt: '',
    lastFollowUpNotes: '',
    followUpEntries: emptyFollowUps(),
    trialBooked: false,
  });

  async function load() {
    const { data } = await api.get('/leads');
    setRows(data);
  }

  async function loadTrainers() {
    try {
      const { data } = await api.get('/trainers');
      setTrainers(Array.isArray(data) ? data : []);
    } catch {
      setTrainers([]);
    }
  }

  useEffect(() => {
    load();
    loadTrainers();
  }, []);

  async function add(e) {
    e.preventDefault();
    if (form.source === 'other' && !(form.sourceOther || '').trim()) {
      alert('Please describe the source when Other is selected.');
      return;
    }
    if (form.source === 'member_referral' && !(form.referralMemberName || '').trim()) {
      alert("Please enter the referring member's name when Member referral is selected.");
      return;
    }
    if (!form.gender) {
      alert('Please select a gender.');
      return;
    }
    await api.post('/leads', {
      name: form.name,
      phone: form.phone,
      gender: form.gender,
      handledBy: form.handledBy.trim() || undefined,
      ...(form.assignedTrainerId
        ? { assignedTrainerId: form.assignedTrainerId }
        : {}),
      source: resolveSourceForApi(form.source, form.sourceOther),
      referralMemberName:
        form.source === 'member_referral'
          ? form.referralMemberName.trim()
          : '',
      notes: form.notes,
      lastFollowUpNotes: form.lastFollowUpNotes,
      followUpEntries: prepareFollowUpEntriesForSave(form.followUpEntries),
      nextFollowUpAt: form.nextFollowUpAt
        ? new Date(form.nextFollowUpAt).toISOString()
        : undefined,
      trialBooked: form.trialBooked,
    });
    setForm({
      name: '',
      phone: '',
      gender: '',
      handledBy: '',
      assignedTrainerId: '',
      source: 'walk_ins',
      sourceOther: '',
      referralMemberName: '',
      notes: '',
      nextFollowUpAt: '',
      lastFollowUpNotes: '',
      followUpEntries: emptyFollowUps(),
      trialBooked: false,
    });
    load();
  }

  const pipelineRows = rows.filter((l) =>
    columns.includes(String(l.status || ''))
  );

  const pipelineLeadCount = pipelineRows.length;

  return (
    <div className="space-y-10">
      <PageHeader
        title="Inquiry"
        subtitle="Add inquiries above, then work them in the pipeline table — stages, notes, and conversion in one place."
      />

      <section
        aria-labelledby="new-inquiry-heading"
        className="rounded-2xl border border-white/[0.08] bg-ink/30 p-5 shadow-panel-sm ring-1 ring-white/[0.04] sm:p-6 lg:p-7"
      >
        <div className="mb-6 max-w-2xl">
          <h2
            id="new-inquiry-heading"
            className="text-sm font-semibold tracking-tight text-white"
          >
            New inquiry
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-400">
            Contact fields stay on one row on large screens; follow-up notes
            sit in their own block so nothing feels stacked on top of itself.
          </p>
        </div>

        <form onSubmit={add} className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-5 lg:gap-y-4">
            <div className="lg:col-span-3">
              <label
                htmlFor="lead-name"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Name
              </label>
              <input
                id="lead-name"
                className="input-dark w-full"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="lg:col-span-3">
              <label
                htmlFor="lead-phone"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Phone
              </label>
              <input
                id="lead-phone"
                className="input-dark w-full"
                placeholder="Mobile or WhatsApp"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div className="lg:col-span-3">
              <label
                htmlFor="lead-gender"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Gender
              </label>
              <select
                id="lead-gender"
                className="input-dark w-full cursor-pointer"
                value={form.gender}
                onChange={(e) =>
                  setForm({ ...form, gender: e.target.value })
                }
                required
              >
                <option value="" disabled>
                  Select gender
                </option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-3">
              <label
                htmlFor="lead-handled-by"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Handled by
              </label>
              <input
                id="lead-handled-by"
                className="input-dark w-full"
                placeholder="Staff name on desk"
                value={form.handledBy}
                onChange={(e) =>
                  setForm({ ...form, handledBy: e.target.value })
                }
                maxLength={120}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label
                htmlFor="lead-source"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Source
              </label>
              <select
                id="lead-source"
                className="input-dark w-full cursor-pointer"
                value={form.source}
                onChange={(e) => {
                  const next = e.target.value;
                  setForm({
                    ...form,
                    source: next,
                    sourceOther: next === 'other' ? form.sourceOther : '',
                    referralMemberName:
                      next === 'member_referral' ? form.referralMemberName : '',
                  });
                }}
              >
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {form.source === 'other' ? (
                <div className="mt-3 space-y-1.5">
                  <label
                    htmlFor="lead-source-other"
                    className="block text-[11px] font-medium uppercase tracking-wide text-gray-500"
                  >
                    Describe source
                  </label>
                  <input
                    id="lead-source-other"
                    className="input-dark w-full"
                    placeholder="e.g. Instagram DM, event name, partner gym…"
                    value={form.sourceOther}
                    onChange={(e) =>
                      setForm({ ...form, sourceOther: e.target.value })
                    }
                    maxLength={200}
                    required
                  />
                </div>
              ) : null}
              {form.source === 'member_referral' ? (
                <div className="mt-3 space-y-1.5">
                  <label
                    htmlFor="lead-referral-member"
                    className="block text-[11px] font-medium uppercase tracking-wide text-gray-500"
                  >
                    Referred by (member name)
                  </label>
                  <input
                    id="lead-referral-member"
                    className="input-dark w-full"
                    placeholder="Existing member's full name"
                    value={form.referralMemberName}
                    onChange={(e) =>
                      setForm({ ...form, referralMemberName: e.target.value })
                    }
                    maxLength={120}
                    required
                  />
                </div>
              ) : null}
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label
                htmlFor="lead-followup"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Next follow-up
              </label>
              <input
                id="lead-followup"
                type="datetime-local"
                className="input-dark w-full min-w-0"
                value={form.nextFollowUpAt}
                onChange={(e) =>
                  setForm({ ...form, nextFollowUpAt: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label
                htmlFor="lead-trial"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Trial booked
              </label>
              <select
                id="lead-trial"
                className="input-dark w-full cursor-pointer"
                value={form.trialBooked ? 'yes' : 'no'}
                onChange={(e) =>
                  setForm({
                    ...form,
                    trialBooked: e.target.value === 'yes',
                  })
                }
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label
                htmlFor="lead-trainer"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Trainer assigned
              </label>
              <select
                id="lead-trainer"
                className="input-dark w-full cursor-pointer"
                value={form.assignedTrainerId}
                onChange={(e) =>
                  setForm({ ...form, assignedTrainerId: e.target.value })
                }
              >
                <option value="">None</option>
                {trainers.map((t) => (
                  <option key={String(t._id)} value={String(t._id)}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
              Follow-up notes
            </p>
            <FollowUpEntriesFields
              entries={form.followUpEntries}
              onChange={(next) => setForm({ ...form, followUpEntries: next })}
              variant="form"
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto sm:min-w-[160px]"
            >
              Add inquiry
            </button>
          </div>
        </form>
      </section>

      <section aria-labelledby="pipeline-heading" className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2
              id="pipeline-heading"
              className="text-base font-semibold tracking-tight text-white"
            >
              Inquiry pipeline
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-gray-500">
              All columns stay inside the panel — text wraps so you do not need a
              horizontal scroller.
            </p>
          </div>
          <p className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium tabular-nums text-gray-400">
            <span className="text-gray-500">Active in pipeline</span>{' '}
            <span className="text-white">{pipelineLeadCount}</span>
          </p>
        </div>

        <InquiryPipelineTable
          leads={pipelineRows}
          statusOrder={columns}
          trainers={trainers}
          onRefresh={load}
        />
      </section>
    </div>
  );
}
