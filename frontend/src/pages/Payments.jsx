import { useCallback, useEffect, useMemo, useState } from 'react';
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
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
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
      return 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/25';
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

export default function Payments() {
  const role = useSelector((s) => s.auth.user?.role);
  const canDelete = CAN_DELETE_PAYMENT.includes(role);

  const [rows, setRows] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(/** @type {string | null} */ (null));
  const [saving, setSaving] = useState(false);

  /** New payment form */
  const [payMemberId, setPayMemberId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [memberPickQuery, setMemberPickQuery] = useState('');

  /** Table filters (applied to API) */
  const [tableFilters, setTableFilters] = useState({
    paymentMethod: '',
    status: '',
    from: '',
    to: '',
    memberId: '',
  });
  const [draftFilters, setDraftFilters] = useState(tableFilters);

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
      return inv.includes(q) || name.includes(q);
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
    return {
      count: displayedRows.length,
      completedSum: totalInView,
      monthSum: monthTotal,
    };
  }, [displayedRows]);

  async function recordCash(e) {
    e.preventDefault();
    const amt = Number(payAmount);
    if (!payMemberId || Number.isNaN(amt) || amt <= 0) {
      toast.error('Choose a member and enter a valid amount greater than 0');
      return;
    }
    setSaving(true);
    try {
      await api.post('/payments', {
        memberId: payMemberId,
        amount: amt,
        paymentMethod: payMethod,
        status: 'completed',
      });
      toast.success(`Recorded ${formatInr(amt)} (${payMethod})`);
      setPayAmount('');
      await loadPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not record payment');
    } finally {
      setSaving(false);
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
    const empty = {
      paymentMethod: '',
      status: '',
      from: '',
      to: '',
      memberId: '',
    };
    setDraftFilters(empty);
    setTableFilters(empty);
    setQuickSearch('');
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payments"
        subtitle="Record fees, filter history, export revenue CSV, and download invoices."
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
      <div className="grid gap-4 sm:grid-cols-3">
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
          <p className="mt-1 text-2xl font-bold text-emerald-300">{formatInr(stats.monthSum)}</p>
          <p className="mt-1 text-[10px] text-gray-600">From loaded rows only</p>
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
              className="mb-2 w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
              placeholder="Search name or email…"
              value={memberPickQuery}
              onChange={(e) => setMemberPickQuery(e.target.value)}
            />
            <select
              className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
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
              className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
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
              className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
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
              className="flex-1 rounded-lg bg-neon py-2.5 text-sm font-semibold text-black disabled:opacity-50 min-w-[140px]"
            >
              {saving ? 'Saving…' : 'Record payment'}
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
              className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
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
              className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
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
              className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
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
              className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
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
              className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
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
          <input
            type="search"
            className="ml-auto min-w-[200px] flex-1 rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm lg:max-w-sm"
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
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">PDF</th>
                {canDelete && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={canDelete ? 8 : 7}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    Loading payments…
                  </td>
                </tr>
              ) : displayedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={canDelete ? 8 : 7}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    No payments match your filters or search.
                  </td>
                </tr>
              ) : (
                displayedRows.map((p) => (
                  <tr key={p._id} className="border-b border-white/5 hover:bg-white/[0.02]">
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
        Invoice PDFs use your session token automatically. Revenue CSV includes invoice number,
        member name snapshot, member id, amount, method, and date.
      </p>
    </div>
  );
}
