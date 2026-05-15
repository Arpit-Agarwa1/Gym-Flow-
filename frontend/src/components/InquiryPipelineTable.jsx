import { Fragment, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import FollowUpEntriesFields from './FollowUpEntriesFields.jsx';
import {
  normalizeFollowUpEntries,
  prepareFollowUpEntriesForSave,
} from '../utils/leadFollowUps.js';

/** @param {string} stage */
function formatStageLabel(stage) {
  if (!stage) return '';
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}

/** @param {string} text @param {number} max */
function truncate(text, max) {
  const t = (text || '').trim();
  if (!t) return '—';
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

/** Small bolt icon for Hot pipeline badge. */
function IconBolt({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M11.983 1.907a.75.75 0 0 0-1.292-.655l-6.5 7.25A.75.75 0 0 0 4.25 9.25h3.279l-1.78 5.887a.75.75 0 0 0 1.292.655l6.5-7.25a.75.75 0 0 0-.659-1.25h-3.28l1.78-5.887Z" />
    </svg>
  );
}

/** Small flame icon for Warm pipeline badge. */
function IconFlame({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M13.5 4.938a7 7 0 1 1-9.006 8.43 4.5 4.5 0 0 1 5.127-5.127 7 7 0 0 1 8.879-5.303Zm-.932 4.9a.75.75 0 0 0-1.04-.144 4.5 4.5 0 0 1-1.5.684 3.5 3.5 0 0 0-2.75 3.945.75.75 0 0 0 .563.724 2.25 2.25 0 0 0 2.712-1.124.75.75 0 0 1 1.313-.327c.631.957 1.153 2.073 1.153 3.327C12 17.4 10.326 19 8.25 19S4.5 17.4 4.5 15.75c0-1.916 1.078-3.558 2.668-4.736a.75.75 0 0 1 .998.072Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** Pipeline temperature badge (reference-style chips). */
function PipelineBadge({ status }) {
  if (status === 'hot') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-100 ring-1 ring-rose-400/35">
        <IconBolt className="h-3.5 w-3.5 shrink-0" />
        Hot
      </span>
    );
  }
  if (status === 'warm') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-100 ring-1 ring-amber-400/35">
        <IconFlame className="h-3.5 w-3.5 shrink-0" />
        Warm
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-100 ring-1 ring-sky-400/30">
      Cold
    </span>
  );
}

/**
 * Human-readable inquiry reference + copy helper.
 * @param {unknown} id
 */
function inquiryCodeFromId(id) {
  const s = String(id || '');
  const tail = s.replace(/\D/g, '').slice(-6) || s.slice(-6);
  return `GF-${tail.toUpperCase()}`;
}

/** @param {Record<string, unknown>} lead */
function formatSourceCell(lead) {
  const src = String(lead.source || '').trim() || '—';
  const ref = String(lead.referralMemberName || '').trim();
  if (src === 'Member referral' && ref) {
    return `${src} (${ref})`;
  }
  return src;
}

/** @param {Record<string, unknown>} lead */
function formatGenderLine(lead) {
  const g = String(lead.gender || 'unspecified');
  const labels = { male: 'Male', female: 'Female', other: 'Other' };
  return labels[g] || '';
}

/** @param {Record<string, unknown>} lead */
function trainerIdFromLead(lead) {
  const t = lead.assignedTrainerId;
  if (!t) return '';
  if (typeof t === 'object' && t !== null && '_id' in t) {
    return String(/** @type {{ _id: unknown }} */ (t)._id);
  }
  return String(t);
}

/** @param {Record<string, unknown>} lead */
function trialIsYes(lead) {
  const v = lead.trialBooked;
  return v === true || v === 'true' || v === 'yes';
}

/**
 * Table-style inquiry pipeline (reference layout: rows, chips, actions).
 * @param {{
 *   leads: Record<string, unknown>[];
 *   statusOrder: string[];
 *   trainers?: { _id: string; name: string }[];
 *   onRefresh: () => void | Promise<void>;
 * }} props
 */
export default function InquiryPipelineTable({
  leads,
  statusOrder,
  onRefresh,
  trainers = [],
}) {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(/** @type {string | null} */ (null));
  /** Which panel is open under a row: remarks = goals/objections; followups = call log slots */
  const [expandedMode, setExpandedMode] = useState(
    /** @type {'remarks' | 'followups' | null} */ (null)
  );
  const [entriesDraft, setEntriesDraft] = useState(/** @type {{ content: string }[]} */ ([]));
  const [remarksDraft, setRemarksDraft] = useState('');
  const [copiedCode, setCopiedCode] = useState(/** @type {string | null} */ (null));

  function closePanel() {
    setExpandedId(null);
    setExpandedMode(null);
  }

  function toggleFollowups(id) {
    if (expandedId === id && expandedMode === 'followups') {
      closePanel();
      return;
    }
    setExpandedId(id);
    setExpandedMode('followups');
  }

  function toggleRemarks(id) {
    if (expandedId === id && expandedMode === 'remarks') {
      closePanel();
      return;
    }
    setExpandedId(id);
    setExpandedMode('remarks');
  }

  useEffect(() => {
    if (expandedId && !leads.some((l) => String(l._id) === expandedId)) {
      setExpandedId(null);
      setExpandedMode(null);
    }
  }, [leads, expandedId]);

  const expandedLead = leads.find((l) => String(l._id) === expandedId);

  useEffect(() => {
    if (!expandedLead) {
      setEntriesDraft([]);
      setRemarksDraft('');
      return;
    }
    setEntriesDraft(normalizeFollowUpEntries(expandedLead));
    setRemarksDraft(
      typeof expandedLead.remarks === 'string' ? expandedLead.remarks : ''
    );
  }, [expandedLead]);

  const refresh = useCallback(async () => {
    await onRefresh();
  }, [onRefresh]);

  async function patchLead(id, body) {
    await api.patch(`/leads/${id}`, body);
    await refresh();
  }

  async function handleStageChange(id, next, current) {
    if (!next || next === current) return;
    await patchLead(id, { status: next });
  }

  async function handleTrialChange(id, nextBool, currentBool) {
    if (nextBool === currentBool) return;
    await patchLead(id, { trialBooked: nextBool });
  }

  async function handleTrainerChange(id, nextId, currentId) {
    const next = nextId || '';
    const cur = currentId || '';
    if (next === cur) return;
    await patchLead(id, { assignedTrainerId: next || null });
  }

  /**
   * Send staff to Members → add flow with plan (membership) — lead convert API is skipped here.
   * @param {Record<string, unknown>} lead
   */
  function goAddMembership(lead) {
    closePanel();
    const name = encodeURIComponent(String(lead.name || '').trim());
    const phone = encodeURIComponent(String(lead.phone || '').trim());
    navigate(`/app/members?add=1&name=${name}&phone=${phone}`);
  }

  async function handleSaveRemarks(id) {
    await patchLead(id, { remarks: remarksDraft.trim() });
    closePanel();
  }

  async function handleSaveFollowups(id) {
    await patchLead(id, {
      followUpEntries: prepareFollowUpEntriesForSave(entriesDraft),
    });
    closePanel();
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode((c) => (c === code ? null : c)), 2000);
    } catch {
      setCopiedCode(null);
    }
  }

  const colCount = 12;

  return (
    <div className="gf-table-shell overflow-hidden">
      <table className="w-full border-collapse text-left text-xs sm:text-sm">
        <thead className="gf-thead">
          <tr>
            <th className="w-8 px-1.5 py-2.5 font-medium sm:px-2" scope="col" aria-label="Select" />
            <th className="px-2 py-2.5 font-medium sm:px-2.5" scope="col">
              Code
            </th>
            <th className="px-2 py-2.5 font-medium sm:px-2.5" scope="col">
              Date
            </th>
            <th className="px-2 py-2.5 font-medium sm:px-2.5" scope="col">
              Name &amp; number
            </th>
            <th className="px-2 py-2.5 font-medium sm:px-2.5" scope="col">
              Next follow-up
            </th>
            <th className="px-2 py-2.5 font-medium sm:px-2.5" scope="col">
              Trial
            </th>
            <th className="px-2 py-2.5 font-medium sm:px-2.5" scope="col">
              Remarks
            </th>
            <th className="px-2 py-2.5 font-medium sm:px-2.5" scope="col">
              Handled by
            </th>
            <th className="px-2 py-2.5 font-medium sm:px-2.5" scope="col">
              Trainer
            </th>
            <th className="px-2 py-2.5 font-medium sm:px-2.5" scope="col">
              Source
            </th>
            <th className="px-2 py-2.5 font-medium sm:px-2.5" scope="col">
              Pipeline
            </th>
            <th className="px-2 py-2.5 font-medium sm:px-2.5" scope="col">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 ? (
            <tr className="gf-tr">
              <td
                className="gf-td-muted px-2 py-10 text-center"
                colSpan={colCount}
              >
                No active inquiries in the pipeline.
              </td>
            </tr>
          ) : (
            leads.map((lead) => {
              const id = String(lead._id ?? '');
              const code = inquiryCodeFromId(lead._id);
              const created = lead.createdAt
                ? new Date(/** @type {string} */ (lead.createdAt))
                : null;
              const nextAt = lead.nextFollowUpAt
                ? new Date(/** @type {string} */ (lead.nextFollowUpAt))
                : null;
              const status = String(lead.status || '');
              const trialYes = trialIsYes(lead);
              const genderText = formatGenderLine(lead);
              const trainerSelectId = trainerIdFromLead(lead);
              const followupsOpen = expandedId === id && expandedMode === 'followups';
              const remarksOpen = expandedId === id && expandedMode === 'remarks';
              const panelOpen = followupsOpen || remarksOpen;

              return (
                <Fragment key={id}>
                  <tr className="gf-tr">
                    <td className="px-1.5 py-2.5 align-top sm:px-2">
                      <input
                        type="checkbox"
                        className="rounded border-white/20 bg-elevated text-neon focus:ring-neon"
                        aria-label={`Select ${lead.name}`}
                      />
                    </td>
                    <td className="px-2 py-2.5 align-top break-words min-w-0">
                      <p className="gf-td-strong font-mono text-xs tracking-tight">
                        {code}
                      </p>
                      <button
                        type="button"
                        className="mt-1 text-[11px] font-medium text-neon/90 hover:text-neon hover:underline"
                        onClick={() => copyCode(code)}
                      >
                        {copiedCode === code ? 'Copied' : 'Copy code'}
                      </button>
                    </td>
                    <td className="gf-td-muted px-2 py-2.5 align-top break-words min-w-0 text-xs leading-snug">
                      {created ? (
                        <>
                          <span className="gf-td-strong block text-[13px] text-white">
                            {created.toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="mt-0.5 block text-gray-500">
                            {created.toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-2 py-2.5 align-top break-words min-w-0">
                      <p className="gf-td-strong text-sm font-semibold leading-snug text-neon sm:text-[15px]">
                        {String(lead.name || '')}
                      </p>
                      <p className="gf-td-muted mt-0.5 text-xs">{String(lead.phone || '')}</p>
                      {genderText ? (
                        <p className="gf-td-muted mt-1 text-[11px] text-gray-500">
                          {genderText}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        className="mt-2 text-[11px] font-medium text-gray-400 underline decoration-white/20 underline-offset-2 hover:text-neon"
                        onClick={() => toggleFollowups(id)}
                      >
                        {followupsOpen ? 'Hide follow-ups' : 'Follow-up history'}
                      </button>
                    </td>
                    <td className="gf-td-muted px-2 py-2.5 align-top break-words min-w-0 text-xs">
                      {nextAt ? (
                        <span className="text-amber-100/95">
                          {nextAt.toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="gf-td-muted px-2 py-2.5 align-top break-words min-w-0 text-xs">
                      <select
                        className="gf-field-compact w-full min-w-0 max-w-full cursor-pointer py-1.5"
                        aria-label="Trial booked"
                        value={trialYes ? 'yes' : 'no'}
                        onChange={(e) =>
                          handleTrialChange(
                            id,
                            e.target.value === 'yes',
                            trialYes
                          )
                        }
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </td>
                    <td className="gf-td-soft px-2 py-2.5 align-top break-words min-w-0 text-xs leading-relaxed">
                      {truncate(/** @type {string} */ (lead.remarks || ''), 56)}
                    </td>
                    <td className="gf-td-muted px-2 py-2.5 align-top break-words min-w-0 text-xs">
                      {String(lead.handledBy || '').trim() || '—'}
                    </td>
                    <td className="gf-td-muted px-2 py-2.5 align-top break-words min-w-0 text-xs">
                      <select
                        className="gf-field-compact w-full min-w-0 max-w-full cursor-pointer py-1.5"
                        aria-label="Trainer assigned"
                        value={trainerSelectId}
                        onChange={(e) =>
                          handleTrainerChange(id, e.target.value, trainerSelectId)
                        }
                      >
                        <option value="">—</option>
                        {trainers.map((t) => (
                          <option key={String(t._id)} value={String(t._id)}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="gf-td-muted px-2 py-2.5 align-top break-words min-w-0 text-xs">
                      {formatSourceCell(lead)}
                    </td>
                    <td className="px-2 py-2.5 align-top break-words min-w-0">
                      <div className="flex flex-col gap-2">
                        <PipelineBadge status={status} />
                        <select
                          className="gf-field-compact w-full min-w-0 max-w-full cursor-pointer py-1.5"
                          aria-label="Change pipeline stage"
                          value={statusOrder.includes(status) ? status : statusOrder[0]}
                          onChange={(e) =>
                            handleStageChange(id, e.target.value, status)
                          }
                        >
                          {statusOrder.map((s) => (
                            <option key={s} value={s}>
                              {formatStageLabel(s)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 align-top break-words min-w-0">
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          className="btn-ghost rounded-lg py-1.5 text-xs font-medium"
                          onClick={() => toggleRemarks(id)}
                        >
                          {remarksOpen ? 'Close remarks' : 'Edit remarks'}
                        </button>
                        <button
                          type="button"
                          className="btn-primary rounded-lg py-1.5 text-xs font-semibold"
                          onClick={() => goAddMembership(lead)}
                        >
                          Add membership
                        </button>
                      </div>
                    </td>
                  </tr>
                  {panelOpen ? (
                    <tr key={`${id}-detail`} className="border-b border-white/[0.08] bg-black/20">
                      <td colSpan={colCount} className="px-4 py-5 sm:px-6">
                        <div className="mx-auto max-w-3xl space-y-5">
                          {remarksOpen ? (
                            <>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Remarks
                              </p>
                              <label htmlFor={`remarks-${id}`} className="sr-only">
                                Remarks
                              </label>
                              <textarea
                                id={`remarks-${id}`}
                                className="input-dark min-h-[88px] w-full resize-y text-sm"
                                placeholder="Goals, timing, objections…"
                                value={remarksDraft}
                                onChange={(e) => setRemarksDraft(e.target.value)}
                                rows={4}
                              />
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  className="btn-primary text-sm"
                                  onClick={() => handleSaveRemarks(id)}
                                >
                                  Save remarks
                                </button>
                                <button
                                  type="button"
                                  className="btn-ghost text-sm"
                                  onClick={closePanel}
                                >
                                  Close
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Follow-up log
                              </p>
                              <FollowUpEntriesFields
                                entries={entriesDraft}
                                onChange={setEntriesDraft}
                                variant="form"
                              />
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  className="btn-primary text-sm"
                                  onClick={() => handleSaveFollowups(id)}
                                >
                                  Save follow-ups
                                </button>
                                <button
                                  type="button"
                                  className="btn-ghost text-sm"
                                  onClick={closePanel}
                                >
                                  Close
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
