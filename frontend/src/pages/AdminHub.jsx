import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import AdminFeatureGuidePanel from '../components/AdminFeatureGuidePanel.jsx';

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

/**
 * Operations center for advanced modules (manager-only APIs).
 */
export default function AdminHub() {
  const [tab, setTab] = useState('audit');
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Advanced operations</h1>
        <p className="text-sm text-gray-400">
          Compliance, integrations, campaigns, and POS — manager access only.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              tab === t.id
                ? 'bg-neon/20 text-neon'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AdminFeatureGuidePanel key={tab} tabId={tab} />

      {tab === 'audit' && (
        <div className="rounded-xl border border-white/10 bg-charcoal p-4 text-sm">
          <ul className="max-h-96 space-y-2 overflow-auto text-xs">
            {audit.map((a) => (
              <li key={a._id} className="border-b border-white/5 pb-2">
                <span className="text-neon">{a.action}</span>{' '}
                <span className="text-gray-500">{a.resource}</span>{' '}
                <span className="text-gray-400">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'referrals' && (
        <ReferralsTab members={members} onRefresh={loadMembers} />
      )}

      {tab === 'trials' && (
        <TrialsTab trials={trials} setTrials={setTrials} />
      )}

      {tab === 'subscriptions' && (
        <SubscriptionsTab subs={subs} members={members} />
      )}

      {tab === 'waivers' && <WaiversTab waivers={waivers} members={members} />}

      {tab === 'inventory' && (
        <InventoryTab products={products} members={members} />
      )}

      {tab === 'shifts' && <ShiftsTab shifts={shifts} />}

      {tab === 'tasks' && (
        <TasksTab templates={taskTpl} runs={taskRuns} />
      )}

      {tab === 'campaigns' && <CampaignsTab campaigns={campaigns} />}

      {tab === 'webhooks' && <WebhooksTab hooks={hooks} />}

      {tab === 'apikeys' && <ApiKeysTab keys={keys} />}

      {tab === 'reminders' && (
        <div className="rounded-xl border border-white/10 bg-charcoal p-6">
          <button
            type="button"
            onClick={runReminders}
            className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-black"
          >
            Run renewal reminder job
          </button>
        </div>
      )}

      {tab === 'backup' && (
        <div className="rounded-xl border border-white/10 bg-charcoal p-6">
          <button
            type="button"
            onClick={downloadBackup}
            className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-black"
          >
            Download backup JSON
          </button>
        </div>
      )}

      {tab === 'gdpr' && <GdprTab members={members} />}

      {tab === 'franchise' && <FranchiseTab />}
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
    <div className="space-y-4 rounded-xl border border-white/10 bg-charcoal p-4">
      <button
        type="button"
        onClick={stats}
        className="text-sm text-neon hover:underline"
      >
        Show referral stats
      </button>
      <ul className="max-h-80 overflow-auto text-sm">
        {members.map((m) => (
          <li key={m._id} className="flex justify-between border-b border-white/5 py-2">
            <span>{m.userId?.name}</span>
            <span className="text-xs text-gray-500">{m.referralCode || '—'}</span>
            <button
              type="button"
              className="text-xs text-neon"
              onClick={() => gen(m._id)}
            >
              Generate
            </button>
          </li>
        ))}
      </ul>
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
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={add} className="space-y-2 rounded-xl border border-white/10 bg-charcoal p-4 text-sm">
        <select name="type" className="w-full rounded bg-ink px-2 py-2">
          <option value="trial">Trial</option>
          <option value="dropin">Drop-in</option>
        </select>
        <input name="visitorName" placeholder="Name" className="w-full rounded bg-ink px-2 py-2" />
        <input name="visitorPhone" placeholder="Phone" className="w-full rounded bg-ink px-2 py-2" />
        <input name="validFrom" type="datetime-local" className="w-full rounded bg-ink px-2 py-2" required />
        <input name="validTo" type="datetime-local" className="w-full rounded bg-ink px-2 py-2" required />
        <button type="submit" className="w-full rounded bg-neon py-2 font-semibold text-black">
          Save
        </button>
      </form>
      <ul className="max-h-80 overflow-auto text-xs">
        {trials.map((t) => (
          <li key={t._id} className="border-b border-white/5 py-2">
            {t.type} · {t.visitorName || '—'} · until {new Date(t.validTo).toLocaleString()}
          </li>
        ))}
      </ul>
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
    <div className="rounded-xl border border-white/10 bg-charcoal p-4">
      <form onSubmit={add} className="flex flex-wrap gap-2 text-sm">
        <select name="memberId" className="rounded bg-ink px-2 py-2" required>
          {members.map((m) => (
            <option key={m._id} value={m._id}>{m.userId?.name}</option>
          ))}
        </select>
        <input name="planId" placeholder="Membership plan ID" className="flex-1 rounded bg-ink px-2 py-2" required />
        <button type="submit" className="rounded bg-neon px-3 py-2 font-semibold text-black">
          Add
        </button>
      </form>
      <ul className="mt-4 max-h-64 overflow-auto text-xs text-gray-400">
        {subs.map((s) => (
          <li key={s._id}>{String(s._id)} · {s.status}</li>
        ))}
      </ul>
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
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={addTpl} className="space-y-2 text-sm">
        <input name="title" placeholder="Title" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" required />
        <textarea name="bodyText" placeholder="Legal text" rows={5} className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" required />
        <input name="version" placeholder="Version" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" />
        <button type="submit" className="rounded bg-neon px-3 py-2 font-semibold text-black">Save template</button>
      </form>
      <form onSubmit={sign} className="space-y-2 text-sm">
        <select name="memberId" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10">
          {members.map((m) => (
            <option key={m._id} value={m._id}>{m.userId?.name}</option>
          ))}
        </select>
        <select name="templateId" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10">
          {waivers.map((w) => (
            <option key={w._id} value={w._id}>{w.title}</option>
          ))}
        </select>
        <button type="submit" className="rounded bg-neon px-3 py-2 font-semibold text-black">Record signature</button>
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
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={addProduct} className="space-y-2 text-sm">
        <input name="name" placeholder="Product name" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" required />
        <input name="sku" placeholder="SKU" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" />
        <input name="price" type="number" placeholder="Price" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" />
        <input name="qty" type="number" placeholder="Stock qty" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" />
        <button type="submit" className="rounded bg-neon px-3 py-2 font-semibold text-black">Add product</button>
      </form>
      <form onSubmit={sale} className="space-y-2 text-sm">
        <select name="productId" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10">
          {products.map((p) => (
            <option key={p._id} value={p._id}>{p.name} (stock {p.stockQty})</option>
          ))}
        </select>
        <input name="qty" type="number" defaultValue={1} className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" />
        <input name="price" type="number" placeholder="Override price (optional)" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" />
        <select name="pay" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10">
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
        </select>
        <select name="memberId" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10">
          <option value="">Walk-in</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>{m.userId?.name}</option>
          ))}
        </select>
        <button type="submit" className="rounded bg-neon px-3 py-2 font-semibold text-black">Record sale</button>
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
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={add} className="space-y-2 text-sm">
        <input name="staffUserId" placeholder="Staff user Mongo ID" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" required />
        <input name="role" placeholder="Role label" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" />
        <input name="start" type="datetime-local" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" required />
        <input name="end" type="datetime-local" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" required />
        <input name="rate" type="number" placeholder="Hourly rate snapshot" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" />
        <button type="submit" className="rounded bg-neon px-3 py-2 font-semibold text-black">Save shift</button>
      </form>
      <ul className="max-h-80 overflow-auto text-xs">
        {shifts.map((s) => (
          <li key={s._id} className="border-b border-white/5 py-2">
            {s.staffUserId?.name || s.staffUserId} · {new Date(s.start).toLocaleString()}
          </li>
        ))}
      </ul>
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
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={addTpl} className="space-y-2 text-sm">
        <input name="title" placeholder="Template title" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" required />
        <textarea name="items" placeholder="One checklist item per line" rows={6} className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" />
        <button type="submit" className="rounded bg-neon px-3 py-2 font-semibold text-black">Save</button>
      </form>
      <div className="text-xs text-gray-400">
        <p className="font-semibold text-white">Recent completions</p>
        <ul className="mt-2 max-h-64 overflow-auto">
          {runs.map((r) => (
            <li key={r._id} className="border-b border-white/5 py-2">
              {new Date(r.completedAt).toLocaleString()}
            </li>
          ))}
        </ul>
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
    <div className="space-y-6">
      <form onSubmit={add} className="grid gap-2 text-sm md:grid-cols-2">
        <input name="name" placeholder="Campaign name" className="rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" required />
        <select name="channel" className="rounded bg-charcoal px-2 py-2 ring-1 ring-white/10">
          <option value="email">Email</option>
          <option value="sms">SMS (logged only)</option>
          <option value="whatsapp">WhatsApp (logged only)</option>
        </select>
        <select name="segment" className="rounded bg-charcoal px-2 py-2 ring-1 ring-white/10">
          <option value="all_members">All members</option>
          <option value="expiring_7d">Expiring 7d</option>
          <option value="expiring_30d">Expiring 30d</option>
          <option value="dormant_30d">Dormant 30d</option>
          <option value="all_leads">All leads</option>
        </select>
        <input name="subject" placeholder="Subject (email)" className="rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" />
        <textarea name="body" placeholder="Message body" rows={3} className="md:col-span-2 rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" required />
        <button type="submit" className="rounded bg-neon px-3 py-2 font-semibold text-black md:col-span-2">Save draft</button>
      </form>
      <ul className="text-sm">
        {campaigns.map((c) => (
          <li key={c._id} className="flex items-center justify-between border-b border-white/5 py-2">
            <span>{c.name} · {c.status}</span>
            <button type="button" className="text-neon" onClick={() => send(c._id)}>Send</button>
          </li>
        ))}
      </ul>
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
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={add} className="space-y-2 text-sm">
        <input name="url" placeholder="https://your-server.com/hook" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" required />
        <input name="events" placeholder="sale.created, trial.created, *" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" />
        <button type="submit" className="rounded bg-neon px-3 py-2 font-semibold text-black">Register</button>
      </form>
      <ul className="text-xs text-gray-400">
        {hooks.map((h) => (
          <li key={h._id} className="border-b border-white/5 py-2">{h.url}</li>
        ))}
      </ul>
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
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={createKey} className="space-y-2 text-sm">
        <input name="name" placeholder="Integration name" className="w-full rounded bg-charcoal px-2 py-2 ring-1 ring-white/10" required />
        <button type="submit" className="rounded bg-neon px-3 py-2 font-semibold text-black">Generate key</button>
      </form>
      <ul className="text-xs">
        {keys.map((k) => (
          <li key={k._id} className="border-b border-white/5 py-2">{k.name} · {k.keyPrefix}…</li>
        ))}
      </ul>
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
    <div className="space-y-4 rounded-xl border border-white/10 bg-charcoal p-4 text-sm">
      <select value={mid} onChange={(e) => setMid(e.target.value)} className="w-full rounded bg-ink px-2 py-2">
        <option value="">Select member</option>
        {members.map((m) => (
          <option key={m._id} value={m._id}>{m.userId?.name}</option>
        ))}
      </select>
      <div className="flex gap-2">
        <button type="button" disabled={!mid} onClick={exp} className="rounded border border-white/20 px-3 py-2 disabled:opacity-40">Export JSON</button>
        <button type="button" disabled={!mid} onClick={anon} className="rounded border border-red-500/40 px-3 py-2 text-red-300 disabled:opacity-40">Anonymize</button>
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
    <div className="rounded-xl border border-white/10 bg-charcoal p-4 text-sm">
      <div className="flex gap-2">
        <input value={pid} onChange={(e) => setPid(e.target.value)} placeholder="Parent gym Mongo ID (optional)" className="flex-1 rounded bg-ink px-2 py-2" />
        <button type="button" onClick={load} className="rounded bg-neon px-3 py-2 font-semibold text-black">Load</button>
      </div>
      <pre className="mt-4 max-h-64 overflow-auto text-xs text-gray-400">{data ? JSON.stringify(data, null, 2) : '—'}</pre>
    </div>
  );
}
