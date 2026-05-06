import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

/** Same as backend managerRoles — only these roles may DELETE payments */
const CAN_DELETE_PAYMENT = ['SuperAdmin', 'GymOwner', 'Manager'];

export default function Payments() {
  const role = useSelector((s) => s.auth.user?.role);
  const canDelete = CAN_DELETE_PAYMENT.includes(role);
  const [rows, setRows] = useState([]);
  const [members, setMembers] = useState([]);
  const [amount, setAmount] = useState('');
  const [memberId, setMemberId] = useState('');

  async function load() {
    const { data } = await api.get('/payments');
    setRows(data);
  }

  useEffect(() => {
    load();
    api.get('/members').then((r) => setMembers(r.data));
  }, []);

  async function recordCash(e) {
    e.preventDefault();
    await api.post('/payments', {
      memberId,
      amount: Number(amount),
      paymentMethod: 'cash',
      status: 'completed',
    });
    setAmount('');
    load();
  }

  async function startRazorpay(e) {
    e.preventDefault();
    const { data: order } = await api.post('/payments/razorpay/order', {
      amount,
      memberId,
    });
    alert(
      order.mock
        ? `Mock Razorpay order ${order.id}. Add real keys in backend .env to go live.`
        : `Order created: ${order.id}`
    );
  }

  async function downloadInvoice(id, invoiceNumber) {
    const res = await api.get(`/payments/${id}/invoice.pdf`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceNumber || id}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
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
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not delete payment');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Payments</h1>
        <p className="text-sm text-gray-400">
          Record fees & download invoices.
          {canDelete && (
            <span className="mt-1 block text-xs text-gray-500">
              Owners and managers can delete a mistaken payment from the table
              below.
            </span>
          )}
        </p>
      </div>

      <form
        onSubmit={recordCash}
        className="grid gap-3 rounded-2xl border border-white/10 bg-charcoal p-5 md:grid-cols-3"
      >
        <select
          className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          required
        >
          <option value="">Member</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.userId?.name}
            </option>
          ))}
        </select>
        <input
          className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm"
          placeholder="Amount ₹"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-neon py-2 text-sm font-semibold text-black"
          >
            Record cash
          </button>
          <button
            type="button"
            onClick={startRazorpay}
            className="flex-1 rounded-lg border border-neon/40 py-2 text-sm text-neon"
          >
            Razorpay test
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-charcoal">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">PDF</th>
              {canDelete && (
                <th className="px-4 py-3 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p._id} className="border-b border-white/5">
                <td className="px-4 py-3 text-gray-300">{p.invoiceNumber}</td>
                <td className="px-4 py-3 text-white">
                  {p.memberName || p.memberId?.userId?.name || '—'}
                </td>
                <td className="px-4 py-3 text-neon">₹{p.amount}</td>
                <td className="px-4 py-3 text-gray-400">{p.paymentMethod}</td>
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
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">
        Invoice PDF uses your JWT automatically via Axios (Authorization header).
      </p>
    </div>
  );
}
