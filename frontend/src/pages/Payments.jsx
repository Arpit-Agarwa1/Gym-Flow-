import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';

/** Same as backend managerRoles — only these roles may DELETE payments */
const CAN_DELETE_PAYMENT = ['SuperAdmin', 'GymOwner', 'Manager'];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'other', label: 'Other' },
];

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending (due / installment)' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const PAYMENT_CATEGORIES = [
  { value: 'membership', label: 'Membership / renewal' },
  { value: 'advance_hold', label: 'Advance / hold booking' },
  { value: 'personal_training', label: 'Personal training' },
  { value: 'other', label: 'Other' },
];

/**
 * Formats paise-scale amounts as INR for display.
 * @param {number} n
 */
function formatInr(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

/**
 * @param {string} status
 */
function statusBadgeClass(status) {
  switch (status) {
    case 'completed':
      return 'bg-neon/15 text-neon ring-neon/25';
    case 'pending':
      return 'bg-amber-500/15 text-amber-200 ring-amber-500/25';
    case 'failed':
      return 'bg-red-500/15 text-red-300 ring-red-500/25';
    case 'refunded':
      return 'bg-violet-500/15 text-violet-200 ring-violet-500/25';
    default:
      return 'bg-white/10 text-gray-300 ring-white/10';
  }
}

/** Human label for stored payment category */
function categoryLabel(value) {
  const match = PAYMENT_CATEGORIES.find((c) => c.value === value);
  return match?.label || (value ? String(value).replace(/_/g, ' ') : '—');
}

/** Pending row whose due date is before today (local midnight). */
function isDueOverdue(p) {
  if (p.status !== 'pending' || !p.dueDate) return false;
  const due = new Date(p.dueDate);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return !Number.isNaN(due.getTime()) && due < startOfToday;
}

/** Short preview for table notes column */
function truncateNotes(s, maxLen = 44) {
  if (!s) return '—';
  const t = String(s);
  return t.length <= maxLen ? t : `${t.slice(0, maxLen)}…`;
}

const EMPTY_TABLE_FILTERS = {
  paymentMethod: '',
  status: '',
  from: '',
  to: '',
  memberId: '',
  category: '',
  trainerId: '',
  overdue: '',
  dueWithinDays: '',
};

export default function Payments() {
  const role = useSelector((s) => s.auth.user?.role);
  const canDelete = CAN_DELETE_PAYMENT.includes(role);

  const [searchParams] = useSearchParams();

  const [rows, setRows] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(/** @type {string | null} */ (null));
  const [saving, setSaving] = useState(false);
  const [trainers, setTrainers] = useState([]);

  /** New payment form */
  const [payMemberId, setPayMemberId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [payCategory, setPayCategory] = useState('membership');
  const [payTrainerId, setPayTrainerId] = useState('');
  const [payDueDate, setPayDueDate] = useState('');
  const [payNotes, setPayNotes] = useState('');
  /** completed = money received now; pending = record a due (needs due date) */
  const [payStatus, setPayStatus] = useState('completed');
  const [memberPickQuery, setMemberPickQuery] = useState('');

  /** Table filters (applied to API); `?overdue=1` opens with overdue pending dues */
  const [tableFilters, setTableFilters] = useState(() => {
    if (searchParams.get('overdue') === '1') {
      return { ...EMPTY_TABLE_FILTERS, status: 'pending', overdue: '1' };
    }
    return { ...EMPTY_TABLE_FILTERS };
  });
  const [draftFilters, setDraftFilters] = useState(() => {
    if (searchParams.get('overdue') === '1') {
      return { ...EMPTY_TABLE_FILTERS, status: 'pending', overdue: '1' };
    }
    return { ...EMPTY_TABLE_FILTERS };
  });

  /** Quick search across invoice / member name (client-side on loaded rows) */
  const [quickSearch, setQuickSearch] = useState('');

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const params = new URLSearchParams();
      if (tableFilters.paymentMethod)
        params.set('paymentMethod', tableFilters.paymentMethod);
      if (tableFilters.status) params.set('status', tableFilters.status);
      if (tableFilters.from) params.set('from', tableFilters.from);
      if (tableFilters.to) params.set('to', tableFilters.to);
      if (tableFilters.memberId) params.set('memberId', tableFilters.memberId);
      if (tableFilters.category) params.set('category', tableFilters.category);
      if (tableFilters.trainerId) params.set('trainerId', tableFilters.trainerId);
      if (tableFilters.overdue === '1') params.set('overdue', 'true');
      if (tableFilters.dueWithinDays)
        params.set('dueWithinDays', tableFilters.dueWithinDays);

      const qs = params.toString();
      const { data } = await api.get(`/payments${qs ? `?${qs}` : ''}`);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e.response?.data?.message || 'Could not load payments';
      setListError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [tableFilters]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    api
      .get('/members')
      .then((r) => setMembers(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Could not load members'));
    api
      .get('/trainers')
      .then((r) => setTrainers(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) =>
      (a.userId?.name || '').localeCompare(b.userId?.name || '', undefined, {
        sensitivity: 'base',
      })
    );
  }, [members]);

  const membersForPicker = useMemo(() => {
    const q = memberPickQuery.trim().toLowerCase();
    if (!q) return sortedMembers;
    return sortedMembers.filter((m) => {
      const name = (m.userId?.name || '').toLowerCase();
      const email = (m.userId?.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [sortedMembers, memberPickQuery]);

  const displayedRows = useMemo(() => {
    const q = quickSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) => {
      const inv = (p.invoiceNumber || '').toLowerCase();
      const name = (
        p.memberName ||
        p.memberId?.userId?.name ||
        ''
      ).toLowerCase();
      const notes = (p.notes || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const tn = (p.trainerName || '').toLowerCase();
      return (
        inv.includes(q) ||
        name.includes(q) ||
        notes.includes(q) ||
        cat.includes(q) ||
        tn.includes(q)
      );
    });
  }, [rows, quickSearch]);

  const stats = useMemo(() => {
    const completed = displayedRows.filter((p) => p.status === 'completed');
    const totalInView = completed.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthTotal = completed
      .filter((p) => {
        const d = p.date ? new Date(p.date) : null;
        return d && !Number.isNaN(d.getTime()) && d >= monthStart;
      })
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const pending = displayedRows.filter((p) => p.status === 'pending');
    const overdue = pending.filter((p) => {
      if (!p.dueDate) return false;
      const due = new Date(p.dueDate);
      return !Number.isNaN(due.getTime()) && due < startOfToday;
    });
    const overdueSum = overdue.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const pendingDueSum = pending.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    return {
      count: displayedRows.length,
      completedSum: totalInView,
      monthSum: monthTotal,
      overdueCount: overdue.length,
      overdueSum,
      pendingDueSum,
    };
  }, [displayedRows]);

  async function recordCash(e) {
    e.preventDefault();
    const amt = Number(payAmount);
    if (!payMemberId || Number.isNaN(amt) || amt <= 0) {
      toast.error('Choose a member and enter a valid amount greater than 0');
      return;
    }
    if (payCategory === 'personal_training' && !payTrainerId) {
      toast.error('Select the trainer for personal training payments');
      return;
    }
    if (payStatus === 'pending' && !payDueDate) {
      toast.error('Set a due date for pending dues / installments');
      return;
    }
    setSaving(true);
    try {
      await api.post('/payments', {
        memberId: payMemberId,
        amount: amt,
        paymentMethod: payMethod,
        status: payStatus,
        category: payCategory,
        trainerId:
          payCategory === 'personal_training' ? payTrainerId : undefined,
        dueDate: payStatus === 'pending' ? payDueDate : undefined,
        notes: payNotes.trim() || undefined,
      });
      toast.success(
        payStatus === 'pending'
          ? `Recorded pending due ${formatInr(amt)} — due ${payDueDate}`
          : `Recorded ${formatInr(amt)} (${payCategory.replace(/_/g, ' ')})`
      );
      setPayAmount('');
      setPayNotes('');
      setPayDueDate('');
      setPayStatus('completed');
      await loadPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not record payment');
    } finally {
      setSaving(false);
    }
  }

  async function markDuePaid(id) {
    try {
      await api.patch(`/payments/${id}`, {
        status: 'completed',
        paymentMethod: 'cash',
      });
      toast.success('Marked as paid');
      await loadPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update payment');
    }
  }

  async function startRazorpay(e) {
    e.preventDefault();
    const amt = Number(payAmount);
    if (!payMemberId || Number.isNaN(amt) || amt <= 0) {
      toast.error('Choose a member and amount first');
      return;
    }
    try {
      const { data: order } = await api.post('/payments/razorpay/order', {
        amount: payAmount,
        memberId: payMemberId,
      });
      toast(
        order.mock
          ? `Mock Razorpay order ${order.id}. Add Razorpay keys in backend .env for live checkout.`
          : `Order created: ${order.id}`,
        { icon: '💳' }
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create order');
    }
  }

  async function downloadInvoice(id, invoiceNumber) {
    try {
      const res = await api.get(`/payments/${id}/invoice.pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber || id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded');
    } catch {
      toast.error('Could not download invoice');
    }
  }

  async function exportRevenueCsv() {
    try {
      const res = await api.get('/reports/revenue?format=csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Revenue CSV exported');
    } catch {
      toast.error('Could not export CSV');
    }
  }

  async function removePayment(id, invoiceNumber) {
    if (
      !confirm(
        `Delete payment ${invoiceNumber || id}? This cannot be undone. Revenue reports will no longer include it.`
      )
    ) {
      return;
    }
    try {
      await api.delete(`/payments/${id}`);
      toast.success('Payment deleted');
      await loadPayments();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not delete payment');
    }
  }

  function applyTableFilters() {
    setTableFilters({ ...draftFilters });
  }

  function resetTableFilters() {
    setDraftFilters({ ...EMPTY_TABLE_FILTERS });
    setTableFilters({ ...EMPTY_TABLE_FILTERS });
    setQuickSearch('');
  }

  /** @param {'overdue' | 'dueWeek' | null} preset */
  function applyDuePreset(preset) {
    const base = {
      ...EMPTY_TABLE_FILTERS,
      status: 'pending',
    };
    if (preset === 'overdue') base.overdue = '1';
    if (preset === 'dueWeek') base.dueWithinDays = '7';
    setDraftFilters(base);
    setTableFilters(base);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payments"
        subtitle="Membership, advance / booking holds, and personal training (with trainer). Record money received now or pending dues with a due date — filter overdue and export revenue CSV."
        actions={
          <button
            type="button"
            onClick={() => exportRevenueCsv()}
            className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.1]"
          >
            Export revenue CSV
          </button>
        }
      />

      {canDelete && (
        <p className="-mt-4 text-xs text-gray-500">
          Owners and managers can delete a mistaken payment from the table.
        </p>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-white/[0.08] bg-ink/40 p-4 ring-1 ring-white/[0.04]">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Completed (in view)
          </p>
          <p className="mt-1 text-2xl font-bold text-neon">{formatInr(stats.completedSum)}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-ink/40 p-4 ring-1 ring-white/[0.04]">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Transactions (in view)
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{stats.count}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-ink/40 p-4 ring-1 ring-white/[0.04]">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Completed this month
          </p>
          <p className="mt-1 text-2xl font-bold text-cream/90">{formatInr(stats.monthSum)}</p>
          <p className="mt-1 text-[10px] text-gray-600">From loaded rows only</p>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4 ring-1 ring-red-500/15">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-red-200/80">
            Overdue pending (in view)
          </p>
          <p className="mt-1 text-2xl font-bold text-red-200">{stats.overdueCount}</p>
          <p className="mt-1 text-sm text-red-200/70">{formatInr(stats.overdueSum)}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4 ring-1 ring-amber-500/15">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-200/80">
            All pending dues (in view)
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-100">{formatInr(stats.pendingDueSum)}</p>
        </div>
      </div>

      {/* Record payment */}
      <form
        onSubmit={recordCash}
        className="space-y-4 rounded-2xl border border-white/10 bg-charcoal p-5 ring-1 ring-white/[0.03]"
      >
        <h2 className="text-sm font-semibold text-white">Record payment</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-4">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Find member
            </label>
            <input
              type="search"
              className="gf-field mb-2 w-full"
              placeholder="Search name or email…"
              value={memberPickQuery}
              onChange={(e) => setMemberPickQuery(e.target.value)}
            />
            <select
              className="gf-field w-full"
              value={payMemberId}
              onChange={(e) => setPayMemberId(e.target.value)}
              required
            >
              <option value="">Select member…</option>
              {membersForPicker.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.userId?.name || 'Member'}
                  {m.userId?.email ? ` · ${m.userId.email}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Amount (₹)
            </label>
            <input
              className="gf-field w-full"
              placeholder="e.g. 5000"
              type="number"
              min={1}
              step={1}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              required
            />
          </div>
          <div className="lg:col-span-2">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Method
            </label>
            <select
              className="gf-field w-full"
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 lg:col-span-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-neon py-2.5 text-sm font-semibold text-ink disabled:opacity-50 min-w-[140px]"
            >
              {saving ? 'Saving…' : payStatus === 'pending' ? 'Save pending due' : 'Record payment'}
            </button>
            <button
              type="button"
              onClick={startRazorpay}
              className="flex-1 rounded-lg border border-neon/40 py-2.5 text-sm text-neon min-w-[140px]"
            >
              Razorpay test order
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-3">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Category
            </label>
            <select
              className="gf-field w-full"
              value={payCategory}
              onChange={(e) => {
                setPayCategory(e.target.value);
                if (e.target.value !== 'personal_training') setPayTrainerId('');
              }}
            >
              {PAYMENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Trainer (for PT only)
            </label>
            <select
              className="gf-field w-full disabled:cursor-not-allowed disabled:opacity-45"
              value={payTrainerId}
              onChange={(e) => setPayTrainerId(e.target.value)}
              disabled={payCategory !== 'personal_training'}
              required={payCategory === 'personal_training'}
            >
              <option value="">Select trainer…</option>
              {trainers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.userId?.name || t.name || 'Trainer'}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Collection
            </label>
            <select
              className="gf-field w-full"
              value={payStatus}
              onChange={(e) => setPayStatus(e.target.value)}
            >
              <option value="completed">Received now</option>
              <option value="pending">Pending — due on date</option>
            </select>
          </div>
          <div className="lg:col-span-3">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Due date {payStatus === 'pending' ? '(required)' : '(optional memo)'}
            </label>
            <input
              type="date"
              className="gf-field w-full disabled:opacity-40"
              value={payDueDate}
              onChange={(e) => setPayDueDate(e.target.value)}
              disabled={payStatus !== 'pending'}
              required={payStatus === 'pending'}
            />
          </div>
          <div className="lg:col-span-12">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Notes (e.g. hold name, installment 2/3, PT package)
            </label>
            <input
              type="text"
              className="gf-field w-full"
              placeholder="Optional — visible on invoice / CSV"
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
            />
          </div>
        </div>
      </form>

      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-charcoal/80 p-5 ring-1 ring-white/[0.03]">
        <h2 className="mb-3 text-sm font-semibold text-white">History filters</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6 lg:items-end">
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500">
              Method
            </label>
            <select
              className="gf-field w-full"
              value={draftFilters.paymentMethod}
              onChange={(e) =>
                setDraftFilters((f) => ({ ...f, paymentMethod: e.target.value }))
              }
            >
              <option value="">All methods</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
              <option value="razorpay">Razorpay</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500">
              Status
            </label>
            <select
              className="gf-field w-full"
              value={draftFilters.status}
              onChange={(e) =>
                setDraftFilters((f) => ({ ...f, status: e.target.value }))
              }
            >
              {STATUSES.map((s) => (
                <option key={s.value || 'all'} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500">
              From
            </label>
            <input
              type="date"
              className="gf-field w-full"
              value={draftFilters.from}
              onChange={(e) =>
                setDraftFilters((f) => ({ ...f, from: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500">
              To
            </label>
            <input
              type="date"
              className="gf-field w-full"
              value={draftFilters.to}
              onChange={(e) =>
                setDraftFilters((f) => ({ ...f, to: e.target.value }))
              }
            />
          </div>
          <div className="lg:col-span-2">
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500">
              Member (optional)
            </label>
            <select
              className="gf-field w-full"
              value={draftFilters.memberId}
              onChange={(e) =>
                setDraftFilters((f) => ({ ...f, memberId: e.target.value }))
              }
            >
              <option value="">All members</option>
              {sortedMembers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.userId?.name || 'Member'}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-6 lg:items-end">
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500">
              Category
            </label>
            <select
              className="gf-field w-full"
              value={draftFilters.category}
              onChange={(e) =>
                setDraftFilters((f) => ({ ...f, category: e.target.value }))
              }
            >
              <option value="">All categories</option>
              {PAYMENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500">
              Trainer (PT)
            </label>
            <select
              className="gf-field w-full"
              value={draftFilters.trainerId}
              onChange={(e) =>
                setDraftFilters((f) => ({ ...f, trainerId: e.target.value }))
              }
            >
              <option value="">All trainers</option>
              {trainers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.userId?.name || t.name || 'Trainer'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500">
              Due focus
            </label>
            <select
              className="gf-field w-full"
              value={
                draftFilters.overdue === '1'
                  ? 'overdue'
                  : draftFilters.dueWithinDays
                    ? 'within'
                    : ''
              }
              onChange={(e) => {
                const v = e.target.value;
                setDraftFilters((f) => ({
                  ...f,
                  overdue: v === 'overdue' ? '1' : '',
                  dueWithinDays: v === 'within' ? f.dueWithinDays || '7' : '',
                }));
              }}
            >
              <option value="">Any due date</option>
              <option value="overdue">Overdue pending only</option>
              <option value="within">Due within next…</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500">
              Days (when “due within”)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              className="gf-field w-full disabled:opacity-40"
              placeholder="7"
              value={draftFilters.dueWithinDays}
              disabled={!draftFilters.dueWithinDays}
              onChange={(e) =>
                setDraftFilters((f) => ({
                  ...f,
                  dueWithinDays: e.target.value,
                  overdue: e.target.value ? '' : f.overdue,
                }))
              }
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={applyTableFilters}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
          >
            Apply filters
          </button>
          <button
            type="button"
            onClick={resetTableFilters}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => applyDuePreset('overdue')}
            className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-200 hover:bg-red-500/10"
          >
            Quick: overdue
          </button>
          <button
            type="button"
            onClick={() => applyDuePreset('dueWeek')}
            className="rounded-lg border border-amber-500/30 px-3 py-2 text-xs font-medium text-amber-200 hover:bg-amber-500/10"
          >
            Quick: due in 7 days
          </button>
          <input
            type="search"
            className="gf-field ml-auto min-w-[200px] flex-1 lg:max-w-sm"
            placeholder="Search invoice or member…"
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
          />
        </div>
      </div>

      {listError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {listError}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-charcoal ring-1 ring-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Trainer</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Collect</th>
                <th className="px-4 py-3">PDF</th>
                {canDelete && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={canDelete ? 13 : 12}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    Loading payments…
                  </td>
                </tr>
              ) : displayedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={canDelete ? 13 : 12}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    No payments match your filters or search.
                  </td>
                </tr>
              ) : (
                displayedRows.map((p) => (
                  <tr
                    key={p._id}
                    className={`border-b border-white/5 hover:bg-white/[0.02] ${isDueOverdue(p) ? 'bg-red-500/[0.06]' : ''}`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-gray-400">
                      {p.date
                        ? new Date(p.date).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-300">
                      {p.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-white">
                      {p.memberName || p.memberId?.userId?.name || '—'}
                    </td>
                    <td className="max-w-[9rem] px-4 py-3 text-xs text-gray-400">
                      {categoryLabel(p.category)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">
                      {p.dueDate ? (
                        <span className={isDueOverdue(p) ? 'font-semibold text-red-300' : 'text-gray-400'}>
                          {new Date(p.dueDate).toLocaleDateString(undefined, {
                            dateStyle: 'medium',
                          })}
                          {isDueOverdue(p) ? (
                            <span className="ml-1 text-[10px] uppercase text-red-400">overdue</span>
                          ) : null}
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="max-w-[8rem] truncate px-4 py-3 text-xs text-gray-400" title={p.trainerName}>
                      {p.trainerName ||
                        (typeof p.trainerId === 'object' && p.trainerId?.name) ||
                        '—'}
                    </td>
                    <td
                      className="max-w-[10rem] truncate px-4 py-3 text-xs text-gray-500"
                      title={p.notes || ''}
                    >
                      {truncateNotes(p.notes)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-neon">
                      {formatInr(Number(p.amount))}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-400">
                      {p.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${statusBadgeClass(p.status)}`}
                      >
                        {p.status || '—'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {p.status === 'pending' ? (
                        <button
                          type="button"
                          className="text-sm font-medium text-neon/90 hover:text-neon hover:underline"
                          onClick={() => markDuePaid(p._id)}
                        >
                          Mark paid
                        </button>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-sm text-neon hover:underline"
                        onClick={() => downloadInvoice(p._id, p.invoiceNumber)}
                      >
                        Download
                      </button>
                    </td>
                    {canDelete && (
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          className="text-sm text-red-400 hover:text-red-300 hover:underline"
                          onClick={() => removePayment(p._id, p.invoiceNumber)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-600">
        Invoice PDFs use your session token automatically. Revenue CSV includes category, trainer,
        due date, notes, invoice number, member snapshot, amount, method, and date.
      </p>
    </div>
  );
}
