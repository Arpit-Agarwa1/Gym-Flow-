import { useEffect, useState } from 'react';
import api from '../api/axios.js';

async function downloadCsv(path, filename) {
  const res = await api.get(path, { responseType: 'blob' });
  const url = window.URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function Reports() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get('/reports/analytics').then((r) => setAnalytics(r.data));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports & exports</h1>
        <p className="text-sm text-gray-400">
          CSV downloads + analytics payload for charts.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <button
          type="button"
          className="rounded-xl border border-white/10 bg-charcoal px-4 py-6 text-left hover:border-neon/40"
          onClick={() =>
            downloadCsv('/reports/revenue?format=csv', 'revenue.csv')
          }
        >
          <p className="text-sm font-semibold text-white">Revenue CSV</p>
          <p className="text-xs text-gray-500">Paid invoices</p>
        </button>
        <button
          type="button"
          className="rounded-xl border border-white/10 bg-charcoal px-4 py-6 text-left hover:border-neon/40"
          onClick={() =>
            downloadCsv('/reports/attendance?format=csv', 'attendance.csv')
          }
        >
          <p className="text-sm font-semibold text-white">Attendance CSV</p>
          <p className="text-xs text-gray-500">Check-in rows</p>
        </button>
        <button
          type="button"
          className="rounded-xl border border-white/10 bg-charcoal px-4 py-6 text-left hover:border-neon/40"
          onClick={() =>
            downloadCsv('/reports/membership?format=csv', 'members.csv')
          }
        >
          <p className="text-sm font-semibold text-white">Membership CSV</p>
          <p className="text-xs text-gray-500">Roster export</p>
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-charcoal p-5">
        <h2 className="text-lg font-semibold text-white">Analytics JSON</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-ink p-4 text-xs text-gray-300">
          {analytics
            ? JSON.stringify(analytics, null, 2)
            : 'Loading analytics…'}
        </pre>
      </div>
    </div>
  );
}
