import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Modal from '../components/Modal.jsx';

export default function Attendance() {
  const [rows, setRows] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberId, setMemberId] = useState('');
  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [scanToken, setScanToken] = useState('');

  async function load() {
    const { data } = await api.get('/attendance');
    setRows(data);
  }

  useEffect(() => {
    load();
    api.get('/members').then((r) => setMembers(r.data));
  }, []);

  async function manual() {
    await api.post('/attendance/manual', { memberId });
    setMemberId('');
    load();
  }

  async function loadQr() {
    const { data } = await api.get(`/attendance/qr/${memberId}`);
    setQrDataUrl(data.qrDataUrl);
    setQrOpen(true);
  }

  async function qrSubmit(e) {
    e.preventDefault();
    await api.post('/attendance/qr', { token: scanToken });
    setScanToken('');
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Attendance</h1>
        <p className="text-sm text-gray-400">
          Manual desk check-in or QR scan (toggle checkout if already in).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-charcoal p-5">
          <h2 className="font-semibold text-white">Manual check-in</h2>
          <div className="mt-4 flex gap-2">
            <select
              className="gf-field flex-1"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            >
              <option value="">Member</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.userId?.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={manual}
              disabled={!memberId}
              className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
            >
              Toggle in/out
            </button>
          </div>
          <button
            type="button"
            className="mt-3 text-sm text-neon hover:underline disabled:text-gray-600"
            disabled={!memberId}
            onClick={loadQr}
          >
            Show QR for selected member
          </button>
        </div>

        <form
          onSubmit={qrSubmit}
          className="rounded-2xl border border-white/10 bg-charcoal p-5"
        >
          <h2 className="font-semibold text-white">QR check-in (kiosk)</h2>
          <textarea
            className="gf-field mt-4 w-full"
            rows={3}
            placeholder="Paste JWT from scanned QR"
            value={scanToken}
            onChange={(e) => setScanToken(e.target.value)}
          />
          <button
            type="submit"
            className="mt-3 w-full rounded-lg bg-neon py-2 text-sm font-semibold text-ink"
          >
            Submit scan
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-charcoal">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">In</th>
              <th className="px-4 py-3">Out</th>
              <th className="px-4 py-3">Min</th>
              <th className="px-4 py-3">Src</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a._id} className="border-b border-white/5">
                <td className="px-4 py-3 text-white">
                  {a.memberId?.userId?.name || '—'}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(a.checkInTime).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {a.checkOutTime
                    ? new Date(a.checkOutTime).toLocaleString()
                    : '—'}
                </td>
                <td className="px-4 py-3 text-gray-400">{a.duration ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{a.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={qrOpen} title="Member QR" onClose={() => setQrOpen(false)}>
        {qrDataUrl && (
          <img src={qrDataUrl} alt="Check-in QR" className="mx-auto max-w-xs" />
        )}
        <p className="mt-3 text-center text-xs text-gray-500">
          Scanner app should read the JWT string (this demo uses QR image).
        </p>
      </Modal>
    </div>
  );
}
