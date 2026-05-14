import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import AdminFeatureGuidePanel from '../components/AdminFeatureGuidePanel.jsx';
import PageHeader from '../components/PageHeader.jsx';

const TABS = [
  { id: 'audit', label: 'Audit log' },
  { id: 'referrals', label: 'Referrals' },
  { id: 'trials', label: 'Trials / drop-ins' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'waivers', label: 'Waivers' },
  { id: 'inventory', label: 'POS & stock' },
  { id: 'shifts', label: 'Shifts' },
  { id: 'tasks', label: 'Checklists' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'apikeys', label: 'API keys' },
  { id: 'reminders', label: 'Renewal reminders' },
  { id: 'backup', label: 'Backup JSON' },
  { id: 'gdpr', label: 'GDPR export / erase' },
  { id: 'franchise', label: 'Franchise rollup' },
];

/** Sidebar clusters — every tab id appears once */
const TAB_GROUPS = [
  { title: 'Compliance & privacy', ids: ['audit', 'waivers', 'gdpr'] },
  { title: 'Members & revenue', ids: ['referrals', 'trials', 'subscriptions', 'reminders'] },
  { title: 'Floor & campaigns', ids: ['inventory', 'shifts', 'tasks', 'campaigns'] },
  { title: 'Integrations & data', ids: ['webhooks', 'apikeys', 'backup', 'franchise'] },
];

/** Shared surface styles for Advanced ops forms and panels */
const adminUi = {
  panel:
    'rounded-2xl border border-white/[0.08] bg-gradient-to-b from-charcoal/95 to-ink/25 p-5 shadow-panel ring-1 ring-white/[0.04]',
  panelMuted: 'rounded-xl border border-white/[0.06] bg-ink/35 p-4',
  field:
    'w-full rounded-xl border border-white/10 bg-ink/90 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-neon/40 focus:ring-2 focus:ring-neon/15',
  label: 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500',
  btnPrimary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-neon px-4 py-2.5 text-sm font-semibold text-black shadow-[0_0_28px_rgba(57,255,20,0.14)] transition hover:brightness-110 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40',
  btnGhost:
    'inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/[0.09]',
  btnDanger:
    'inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/35 bg-red-500/[0.08] px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-500/[0.14] disabled:pointer-events-none disabled:opacity-40',
  tableWrap: 'overflow-hidden rounded-xl border border-white/[0.06] bg-ink/20',
};

function tabLabel(id) {
  return TABS.find((t) => t.id === id)?.label ?? id;
}

/**
 * Operations center for advanced modules (manager-only APIs).
 */
export default function AdminHub() {
  const [tab, setTab] = useState('audit');
  const [tabLoading, setTabLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [audit, setAudit] = useState([]);
  const [trials, setTrials] = useState([]);
  const [subs, setSubs] = useState([]);
  const [waivers, setWaivers] = useState([]);
  const [products, setProducts] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [taskTpl, setTaskTpl] = useState([]);
  const [taskRuns, setTaskRuns] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [hooks, setHooks] = useState([]);
  const [keys, setKeys] = useState([]);

  const loadMembers = useCallback(async () => {
    const { data } = await api.get('/members');
    setMembers(data);
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    async function load() {
      setTabLoading(true);
      try {
        if (tab === 'audit') {
          const { data } = await api.get('/platform/audit-logs');
          setAudit(data);
        } else if (tab === 'trials') {
          const { data } = await api.get('/platform/trial-passes');
          setTrials(data);
        } else if (tab === 'subscriptions') {
          const { data } = await api.get('/platform/subscriptions');
          setSubs(data);
        } else if (tab === 'waivers') {
          const { data } = await api.get('/platform/waiver-templates');
          setWaivers(data);
        } else if (tab === 'inventory') {
          const { data } = await api.get('/platform/products');
          setProducts(data);
        } else if (tab === 'shifts') {
          const { data } = await api.get('/platform/shifts');
          setShifts(data);
        } else if (tab === 'tasks') {
          const [t, r] = await Promise.all([
            api.get('/platform/task-templates'),
            api.get('/platform/task-runs'),
          ]);
          setTaskTpl(t.data);
          setTaskRuns(r.data);
        } else if (tab === 'campaigns') {
          const { data } = await api.get('/platform/campaigns');
          setCampaigns(data);
        } else if (tab === 'webhooks') {
          const { data } = await api.get('/platform/webhooks');
          setHooks(data);
        } else if (tab === 'apikeys') {
          const { data } = await api.get('/platform/api-keys');
          setKeys(data);
        }
      } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to load');
      } finally {
        setTabLoading(false);
      }
    }
    load();
  }, [tab]);

  async function runReminders() {
    try {
      const { data } = await api.post('/platform/reminders/run', { days: 14 });
      toast.success(`Reminders processed: ${data.reminded}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  }

  async function downloadBackup() {
    try {
      const { data } = await api.get('/platform/backup/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gymflow-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup downloaded');
    } catch (e) {
      toast.error('Backup failed');
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Advanced operations"
        subtitle="Compliance, integrations, campaigns, and POS — manager access only. Pick a module on the left (desktop) or scroll the strip on mobile."
        actions={
          <span className="rounded-full border border-neon/25 bg-neon/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-neon">
            Manager
          </span>
        }
      />

      {/* Mobile: horizontal tab strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
              tab === t.id
                ? 'bg-neon text-black shadow-[0_0_20px_rgba(57,255,20,0.25)]'
                : 'border border-white/10 bg-white/[0.04] text-gray-300 hover:border-white/20 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Desktop sidebar */}
        <aside className="hidden w-full min-w-0 max-w-[260px] shrink-0 lg:block">
          <div className="sticky top-4 max-h-[calc(100vh-6rem)] space-y-6 overflow-y-auto rounded-2xl border border-white/[0.07] bg-charcoal/50 p-3 pr-2 shadow-panel ring-1 ring-white/[0.03] backdrop-blur-sm dashboard-scroll">
            {TAB_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-600">
                  {group.title}
                </p>
                <nav className="space-y-0.5" aria-label={group.title}>
                  {group.ids.map((id) => {
                    const active = tab === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTab(id)}
                        aria-current={active ? 'page' : undefined}
                        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${
                          active
                            ? 'bg-neon/14 text-neon shadow-[inset_0_0_0_1px_rgba(57,255,20,0.28)]'
                            : 'text-gray-400 hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            active ? 'bg-neon shadow-[0_0_8px_#39ff14]' : 'bg-gray-600'
                          }`}
                          aria-hidden
                        />
                        {tabLabel(id)}
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-5">
          <div className="relative min-h-[200px] space-y-5">
            {tabLoading ? (
              <div
                className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-charcoal/55 backdrop-blur-[2px]"
                aria-busy="true"
                aria-live="polite"
              >
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink/80 px-4 py-3 shadow-panel">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-neon/30 border-t-neon" />
                  <span className="text-sm text-gray-300">Loading…</span>
                </div>
              </div>
            ) : null}

            <AdminFeatureGuidePanel key={tab} tabId={tab} />

            <div className={tabLoading ? 'opacity-50 transition-opacity' : ''}>
              {tab === 'audit' && (
                <div className={adminUi.panel}>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Recent events
                  </h3>
                  <div className={adminUi.tableWrap}>
                    <div className="max-h-[28rem] overflow-auto">
                      <table className="w-full min-w-[520px] text-left text-xs">
                        <thead className="sticky top-0 z-[1] border-b border-white/10 bg-ink/95 backdrop-blur-sm">
                          <tr className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                            <th className="px-3 py-2.5">Action</th>
                            <th className="px-3 py-2.5">Resource</th>
                            <th className="px-3 py-2.5">When</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05] text-gray-300">
                          {audit.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="px-3 py-8 text-center text-gray-500">
                                No audit entries yet.
                              </td>
                            </tr>
                          ) : (
                            audit.map((a) => (
                              <tr key={a._id} className="hover:bg-white/[0.02]">
                                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-neon">
                                  {a.action}
                                </td>
                                <td className="px-3 py-2.5 text-gray-400">{a.resource || '—'}</td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-gray-500">
                                  {new Date(a.createdAt).toLocaleString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'referrals' && (
                <ReferralsTab members={members} onRefresh={loadMembers} />
              )}

              {tab === 'trials' && <TrialsTab trials={trials} setTrials={setTrials} />}

              {tab === 'subscriptions' && (
                <SubscriptionsTab subs={subs} members={members} />
              )}

              {tab === 'waivers' && <WaiversTab waivers={waivers} members={members} />}

              {tab === 'inventory' && (
                <InventoryTab products={products} members={members} />
              )}

              {tab === 'shifts' && <ShiftsTab shifts={shifts} />}

              {tab === 'tasks' && <TasksTab templates={taskTpl} runs={taskRuns} />}

              {tab === 'campaigns' && <CampaignsTab campaigns={campaigns} />}

              {tab === 'webhooks' && <WebhooksTab hooks={hooks} />}

              {tab === 'apikeys' && <ApiKeysTab keys={keys} />}

              {tab === 'reminders' && (
                <div className={`${adminUi.panel} space-y-4`}>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Renewal reminders</h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      Sends (or logs) emails for memberships expiring within the configured window.
                      Requires SMTP in backend <code className="rounded bg-ink px-1 text-[10px] text-neon/90">.env</code> for live email.
                    </p>
                  </div>
                  <button type="button" onClick={runReminders} className={adminUi.btnPrimary}>
                    Run renewal reminder job
                  </button>
                </div>
              )}

              {tab === 'backup' && (
                <div className={`${adminUi.panel} space-y-4`}>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Backup JSON</h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      Download a portable JSON snapshot (members, payments, leads, products). Not a full
                      database replacement — keep MongoDB backups too.
                    </p>
                  </div>
                  <button type="button" onClick={downloadBackup} className={adminUi.btnPrimary}>
                    Download backup JSON
                  </button>
                </div>
              )}

              {tab === 'gdpr' && <GdprTab members={members} />}

              {tab === 'franchise' && <FranchiseTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReferralsTab({ members, onRefresh }) {
  async function gen(id) {
    try {
      const { data } = await api.post(`/platform/referrals/${id}/generate`);
      toast.success(`Code: ${data.referralCode}`);
      onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  }
  async function stats() {
    const { data } = await api.get('/platform/referrals/stats');
    toast(
      `Referred members: ${data.referredMembers} · With codes: ${data.membersWithReferralCode}`
    );
  }
  return (
    <div className={`${adminUi.panel} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">Member referral codes</h3>
        <button type="button" onClick={stats} className={adminUi.btnGhost}>
          Show referral stats
        </button>
      </div>
      <div className={adminUi.tableWrap}>
        <ul className="max-h-[22rem] divide-y divide-white/[0.06] overflow-auto text-sm">
          {members.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">No members loaded.</li>
          ) : (
            members.map((m) => (
              <li
                key={m._id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.02]"
              >
                <span className="font-medium text-white">{m.userId?.name ?? '—'}</span>
                <span className="font-mono text-xs text-gray-400">{m.referralCode || '—'}</span>
                <button type="button" className={`${adminUi.btnGhost} !py-2 text-xs`} onClick={() => gen(m._id)}>
                  Generate
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

function TrialsTab({ trials, setTrials }) {
  async function add(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.post('/platform/trial-passes', {
        type: fd.get('type'),
        visitorName: fd.get('visitorName'),
        visitorPhone: fd.get('visitorPhone'),
        validFrom: new Date(fd.get('validFrom')).toISOString(),
        validTo: new Date(fd.get('validTo')).toISOString(),
      });
      toast.success('Trial / drop-in created');
      e.target.reset();
      const { data } = await api.get('/platform/trial-passes');
      setTrials(data);
    } catch (err) {
      toast.error('Failed');
    }
  }
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={add} className={`${adminUi.panel} space-y-3`}>
        <h3 className="text-sm font-semibold text-white">Create trial / drop-in</h3>
        <div>
          <label className={adminUi.label}>Type</label>
          <select name="type" className={adminUi.field}>
            <option value="trial">Trial</option>
            <option value="dropin">Drop-in</option>
          </select>
        </div>
        <div>
          <label className={adminUi.label}>Visitor name</label>
          <input name="visitorName" placeholder="Name" className={adminUi.field} />
        </div>
        <div>
          <label className={adminUi.label}>Phone</label>
          <input name="visitorPhone" placeholder="Phone" className={adminUi.field} />
        </div>
        <div>
          <label className={adminUi.label}>Valid from</label>
          <input name="validFrom" type="datetime-local" className={adminUi.field} required />
        </div>
        <div>
          <label className={adminUi.label}>Valid to</label>
          <input name="validTo" type="datetime-local" className={adminUi.field} required />
        </div>
        <button type="submit" className={`${adminUi.btnPrimary} w-full`}>
          Save pass
        </button>
      </form>
      <div className={`${adminUi.panel} flex flex-col`}>
        <h3 className="mb-3 text-sm font-semibold text-white">Active & recent passes</h3>
        <div className={adminUi.tableWrap}>
          <ul className="max-h-[28rem] divide-y divide-white/[0.06] overflow-auto text-xs">
            {trials.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500">No passes yet.</li>
            ) : (
              trials.map((t) => (
                <li key={t._id} className="px-4 py-3 text-gray-300 hover:bg-white/[0.02]">
                  <span className="font-medium capitalize text-neon/90">{t.type}</span>
                  <span className="text-gray-500"> · </span>
                  {t.visitorName || '—'}
                  <span className="mt-1 block text-[11px] text-gray-500">
                    Until {new Date(t.validTo).toLocaleString()}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SubscriptionsTab({ subs, members }) {
  async function add(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.post('/platform/subscriptions', {
        memberId: fd.get('memberId'),
        membershipPlanId: fd.get('planId'),
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      });
      toast.success('Subscription row created (link Razorpay ID in app data)');
    } catch {
      toast.error('Failed');
    }
  }
  return (
    <div className={`${adminUi.panel} space-y-5`}>
      <h3 className="text-sm font-semibold text-white">Subscription rows</h3>
      <form onSubmit={add} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[180px] flex-1">
          <label className={adminUi.label}>Member</label>
          <select name="memberId" className={adminUi.field} required>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.userId?.name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[200px] flex-[2]">
          <label className={adminUi.label}>Membership plan ID</label>
          <input
            name="planId"
            placeholder="Paste plan Mongo ID"
            className={adminUi.field}
            required
          />
        </div>
        <button type="submit" className={adminUi.btnPrimary}>
          Add row
        </button>
      </form>
      <div className={adminUi.tableWrap}>
        <ul className="max-h-56 divide-y divide-white/[0.06] overflow-auto font-mono text-xs text-gray-400">
          {subs.length === 0 ? (
            <li className="px-4 py-6 text-center text-gray-500">No subscription rows.</li>
          ) : (
            subs.map((s) => (
              <li key={s._id} className="px-4 py-2.5 hover:bg-white/[0.02]">
                {String(s._id)} · <span className="text-gray-300">{s.status}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

function WaiversTab({ waivers, members }) {
  async function addTpl(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    await api.post('/platform/waiver-templates', {
      title: fd.get('title'),
      bodyText: fd.get('bodyText'),
      version: fd.get('version') || '1.0',
    });
    toast.success('Template saved');
  }
  async function sign(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    await api.post('/platform/waivers/sign', {
      memberId: fd.get('memberId'),
      templateId: fd.get('templateId'),
    });
    toast.success('Signature recorded');
  }
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={addTpl} className={`${adminUi.panel} space-y-3`}>
        <h3 className="text-sm font-semibold text-white">New waiver template</h3>
        <div>
          <label className={adminUi.label}>Title</label>
          <input name="title" placeholder="Title" className={adminUi.field} required />
        </div>
        <div>
          <label className={adminUi.label}>Legal text</label>
          <textarea
            name="bodyText"
            placeholder="Legal text"
            rows={5}
            className={adminUi.field}
            required
          />
        </div>
        <div>
          <label className={adminUi.label}>Version</label>
          <input name="version" placeholder="e.g. 1.0" className={adminUi.field} />
        </div>
        <button type="submit" className={`${adminUi.btnPrimary} w-full`}>
          Save template
        </button>
      </form>
      <form onSubmit={sign} className={`${adminUi.panel} space-y-3`}>
        <h3 className="text-sm font-semibold text-white">Record signature</h3>
        <div>
          <label className={adminUi.label}>Member</label>
          <select name="memberId" className={adminUi.field}>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.userId?.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={adminUi.label}>Template</label>
          <select name="templateId" className={adminUi.field}>
            {waivers.map((w) => (
              <option key={w._id} value={w._id}>
                {w.title}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={`${adminUi.btnPrimary} w-full`}>
          Record signature
        </button>
      </form>
    </div>
  );
}

function InventoryTab({ products, members }) {
  async function addProduct(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    await api.post('/platform/products', {
      name: fd.get('name'),
      sku: fd.get('sku'),
      price: Number(fd.get('price')),
      stockQty: Number(fd.get('qty')),
    });
    toast.success('Product added');
  }
  async function sale(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const pid = fd.get('productId');
    const line = {
      productId: pid,
      qty: Number(fd.get('qty')) || 1,
    };
    const pr = fd.get('price');
    if (pr) line.unitPrice = Number(pr);
    await api.post('/platform/sales', {
      lines: [line],
      paymentMethod: fd.get('pay'),
      memberId: fd.get('memberId') || undefined,
    });
    toast.success('Sale recorded');
  }
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={addProduct} className={`${adminUi.panel} space-y-3`}>
        <h3 className="text-sm font-semibold text-white">Add product</h3>
        <div>
          <label className={adminUi.label}>Name</label>
          <input name="name" placeholder="Product name" className={adminUi.field} required />
        </div>
        <div>
          <label className={adminUi.label}>SKU</label>
          <input name="sku" placeholder="Optional SKU" className={adminUi.field} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={adminUi.label}>Price</label>
            <input name="price" type="number" placeholder="0" className={adminUi.field} />
          </div>
          <div>
            <label className={adminUi.label}>Stock qty</label>
            <input name="qty" type="number" placeholder="0" className={adminUi.field} />
          </div>
        </div>
        <button type="submit" className={`${adminUi.btnPrimary} w-full`}>
          Add product
        </button>
      </form>
      <form onSubmit={sale} className={`${adminUi.panel} space-y-3`}>
        <h3 className="text-sm font-semibold text-white">Record sale</h3>
        <div>
          <label className={adminUi.label}>Product</label>
          <select name="productId" className={adminUi.field}>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} (stock {p.stockQty})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={adminUi.label}>Qty</label>
            <input name="qty" type="number" defaultValue={1} className={adminUi.field} />
          </div>
          <div>
            <label className={adminUi.label}>Override price</label>
            <input name="price" type="number" placeholder="Optional" className={adminUi.field} />
          </div>
        </div>
        <div>
          <label className={adminUi.label}>Payment</label>
          <select name="pay" className={adminUi.field}>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
          </select>
        </div>
        <div>
          <label className={adminUi.label}>Member</label>
          <select name="memberId" className={adminUi.field}>
            <option value="">Walk-in</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.userId?.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={`${adminUi.btnPrimary} w-full`}>
          Record sale
        </button>
      </form>
    </div>
  );
}

function ShiftsTab({ shifts }) {
  async function add(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    await api.post('/platform/shifts', {
      staffUserId: fd.get('staffUserId'),
      roleLabel: fd.get('role') || 'Staff',
      start: fd.get('start'),
      end: fd.get('end'),
      hourlyRateSnapshot: fd.get('rate') ? Number(fd.get('rate')) : undefined,
    });
    toast.success('Shift added');
  }
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={add} className={`${adminUi.panel} space-y-3`}>
        <h3 className="text-sm font-semibold text-white">Log shift</h3>
        <div>
          <label className={adminUi.label}>Staff user Mongo ID</label>
          <input name="staffUserId" placeholder="User _id" className={adminUi.field} required />
        </div>
        <div>
          <label className={adminUi.label}>Role label</label>
          <input name="role" placeholder="e.g. Front desk" className={adminUi.field} />
        </div>
        <div>
          <label className={adminUi.label}>Start</label>
          <input name="start" type="datetime-local" className={adminUi.field} required />
        </div>
        <div>
          <label className={adminUi.label}>End</label>
          <input name="end" type="datetime-local" className={adminUi.field} required />
        </div>
        <div>
          <label className={adminUi.label}>Hourly rate snapshot</label>
          <input name="rate" type="number" placeholder="Optional" className={adminUi.field} />
        </div>
        <button type="submit" className={`${adminUi.btnPrimary} w-full`}>
          Save shift
        </button>
      </form>
      <div className={`${adminUi.panel} flex flex-col`}>
        <h3 className="mb-3 text-sm font-semibold text-white">Recent shifts</h3>
        <div className={adminUi.tableWrap}>
          <ul className="max-h-[28rem] divide-y divide-white/[0.06] overflow-auto text-xs">
            {shifts.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500">No shifts.</li>
            ) : (
              shifts.map((s) => (
                <li key={s._id} className="px-4 py-3 text-gray-300 hover:bg-white/[0.02]">
                  {s.staffUserId?.name || String(s.staffUserId)}
                  <span className="mt-1 block text-[11px] text-gray-500">
                    {new Date(s.start).toLocaleString()}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function TasksTab({ templates, runs }) {
  async function addTpl(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const items = fd.get('items').split('\n').filter(Boolean);
    await api.post('/platform/task-templates', {
      title: fd.get('title'),
      items,
    });
    toast.success('Checklist template saved');
  }
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={addTpl} className={`${adminUi.panel} space-y-3`}>
        <h3 className="text-sm font-semibold text-white">Checklist template</h3>
        <div>
          <label className={adminUi.label}>Title</label>
          <input name="title" placeholder="Template title" className={adminUi.field} required />
        </div>
        <div>
          <label className={adminUi.label}>Items (one per line)</label>
          <textarea
            name="items"
            placeholder="One checklist item per line"
            rows={6}
            className={adminUi.field}
          />
        </div>
        <button type="submit" className={`${adminUi.btnPrimary} w-full`}>
          Save template
        </button>
      </form>
      <div className={`${adminUi.panel}`}>
        <h3 className="mb-3 text-sm font-semibold text-white">Recent completions</h3>
        <div className={adminUi.tableWrap}>
          <ul className="max-h-64 divide-y divide-white/[0.06] overflow-auto text-xs text-gray-400">
            {runs.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500">No runs yet.</li>
            ) : (
              runs.map((r) => (
                <li key={r._id} className="px-4 py-2.5 hover:bg-white/[0.02]">
                  {new Date(r.completedAt).toLocaleString()}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function CampaignsTab({ campaigns }) {
  async function add(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const { data } = await api.post('/platform/campaigns', {
      name: fd.get('name'),
      channel: fd.get('channel'),
      segment: fd.get('segment'),
      subject: fd.get('subject'),
      body: fd.get('body'),
      status: 'draft',
    });
    toast.success(`Campaign ${data._id} created`);
  }
  async function send(id) {
    await api.post(`/platform/campaigns/${id}/send`);
    toast.success('Send job finished (check SMTP / logs)');
  }
  return (
    <div className={`${adminUi.panel} space-y-6`}>
      <form onSubmit={add} className="grid gap-3 text-sm md:grid-cols-2">
        <h3 className="text-sm font-semibold text-white md:col-span-2">New campaign (draft)</h3>
        <div className="md:col-span-1">
          <label className={adminUi.label}>Name</label>
          <input name="name" placeholder="Campaign name" className={adminUi.field} required />
        </div>
        <div>
          <label className={adminUi.label}>Channel</label>
          <select name="channel" className={adminUi.field}>
            <option value="email">Email</option>
            <option value="sms">SMS (logged only)</option>
            <option value="whatsapp">WhatsApp (logged only)</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={adminUi.label}>Audience</label>
          <select name="segment" className={adminUi.field}>
            <option value="all_members">All members</option>
            <option value="expiring_7d">Expiring 7d</option>
            <option value="expiring_30d">Expiring 30d</option>
            <option value="dormant_30d">Dormant 30d</option>
            <option value="all_leads">All leads</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={adminUi.label}>Subject (email)</label>
          <input name="subject" placeholder="Subject" className={adminUi.field} />
        </div>
        <div className="md:col-span-2">
          <label className={adminUi.label}>Body</label>
          <textarea
            name="body"
            placeholder="Message body"
            rows={3}
            className={adminUi.field}
            required
          />
        </div>
        <button type="submit" className={`${adminUi.btnPrimary} md:col-span-2`}>
          Save draft
        </button>
      </form>
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Saved campaigns
        </h4>
        <div className={adminUi.tableWrap}>
          <ul className="divide-y divide-white/[0.06] text-sm">
            {campaigns.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500">No campaigns.</li>
            ) : (
              campaigns.map((c) => (
                <li
                  key={c._id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.02]"
                >
                  <span className="text-gray-200">
                    {c.name}{' '}
                    <span className="text-xs text-gray-500">· {c.status}</span>
                  </span>
                  <button type="button" className={adminUi.btnGhost} onClick={() => send(c._id)}>
                    Send
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function WebhooksTab({ hooks }) {
  async function add(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const events = fd.get('events').split(',').map((s) => s.trim()).filter(Boolean);
    const { data } = await api.post('/platform/webhooks', {
      url: fd.get('url'),
      events,
    });
    toast.success(`Secret (save once): ${data.secret}`, { duration: 12000 });
  }
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={add} className={`${adminUi.panel} space-y-3`}>
        <h3 className="text-sm font-semibold text-white">Register webhook</h3>
        <div>
          <label className={adminUi.label}>URL</label>
          <input
            name="url"
            placeholder="https://your-server.com/hook"
            className={adminUi.field}
            required
          />
        </div>
        <div>
          <label className={adminUi.label}>Events (comma-separated)</label>
          <input
            name="events"
            placeholder="sale.created, trial.created, *"
            className={adminUi.field}
          />
        </div>
        <button type="submit" className={`${adminUi.btnPrimary} w-full`}>
          Register
        </button>
      </form>
      <div className={`${adminUi.panel} flex flex-col`}>
        <h3 className="mb-3 text-sm font-semibold text-white">Active endpoints</h3>
        <div className={adminUi.tableWrap}>
          <ul className="max-h-64 divide-y divide-white/[0.06] overflow-auto text-xs text-gray-400">
            {hooks.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500">No webhooks.</li>
            ) : (
              hooks.map((h) => (
                <li key={h._id} className="break-all px-4 py-3 font-mono hover:bg-white/[0.02]">
                  {h.url}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ApiKeysTab({ keys }) {
  async function createKey(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const { data } = await api.post('/platform/api-keys', {
      name: fd.get('name'),
    });
    toast.success(`API key: ${data.key}`, { duration: 20000 });
  }
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={createKey} className={`${adminUi.panel} space-y-3`}>
        <h3 className="text-sm font-semibold text-white">Generate API key</h3>
        <div>
          <label className={adminUi.label}>Integration name</label>
          <input name="name" placeholder="e.g. Access control bridge" className={adminUi.field} required />
        </div>
        <button type="submit" className={`${adminUi.btnPrimary} w-full`}>
          Generate key
        </button>
      </form>
      <div className={`${adminUi.panel} flex flex-col`}>
        <h3 className="mb-3 text-sm font-semibold text-white">Existing keys</h3>
        <div className={adminUi.tableWrap}>
          <ul className="max-h-64 divide-y divide-white/[0.06] overflow-auto text-xs">
            {keys.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500">No keys yet.</li>
            ) : (
              keys.map((k) => (
                <li key={k._id} className="px-4 py-2.5 text-gray-300 hover:bg-white/[0.02]">
                  <span className="font-medium text-white">{k.name}</span>
                  <span className="ml-2 font-mono text-gray-500">
                    {k.keyPrefix}…
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function GdprTab({ members }) {
  const [mid, setMid] = useState('');
  async function exp() {
    const { data } = await api.get(`/platform/members/${mid}/gdpr-export`);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `member-export-${mid}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported');
  }
  async function anon() {
    if (!confirm('Anonymize this member and linked user PII?')) return;
    await api.post(`/platform/members/${mid}/gdpr-anonymize`);
    toast.success('Anonymized');
  }
  return (
    <div className={`${adminUi.panel} space-y-4`}>
      <div>
        <h3 className="text-sm font-semibold text-white">Member data requests</h3>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Export JSON for portability, or anonymize after legal sign-off. Actions are audit-logged.
        </p>
      </div>
      <div>
        <label className={adminUi.label}>Member</label>
        <select value={mid} onChange={(e) => setMid(e.target.value)} className={adminUi.field}>
          <option value="">Select member</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.userId?.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!mid} onClick={exp} className={adminUi.btnGhost}>
          Export JSON
        </button>
        <button type="button" disabled={!mid} onClick={anon} className={adminUi.btnDanger}>
          Anonymize
        </button>
      </div>
    </div>
  );
}

function FranchiseTab() {
  const [pid, setPid] = useState('');
  const [data, setData] = useState(null);
  async function load() {
    const { data: d } = await api.get('/platform/franchise/summary', {
      params: pid ? { parentId: pid } : {},
    });
    setData(d);
  }
  return (
    <div className={`${adminUi.panel} space-y-4`}>
      <div>
        <h3 className="text-sm font-semibold text-white">Franchise rollup</h3>
        <p className="mt-1 text-xs text-gray-500">
          Optional parent gym Mongo ID to aggregate child locations.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label className={adminUi.label}>Parent gym ID (optional)</label>
          <input
            value={pid}
            onChange={(e) => setPid(e.target.value)}
            placeholder="Parent gym Mongo ID"
            className={adminUi.field}
          />
        </div>
        <button type="button" onClick={load} className={adminUi.btnPrimary}>
          Load summary
        </button>
      </div>
      <div className={`${adminUi.panelMuted} max-h-72 overflow-auto`}>
        <pre className="whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-gray-400">
          {data ? JSON.stringify(data, null, 2) : 'Run load to see JSON.'}
        </pre>
      </div>
    </div>
  );
}
