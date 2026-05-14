import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

/**
 * Command-style search across members, leads, and invoice numbers (staff API).
 */
export default function GlobalSearch() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setData(null);
      return undefined;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const { data: d } = await api.get('/platform/search', {
          params: { q: q.trim() },
        });
        setData(d);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full min-w-0 lg:max-w-xl lg:flex-1"
    >
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500 dark:text-gray-400">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      </div>
      <input
        type="search"
        placeholder="Search members, invoices…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="input-dark w-full py-2.5 pl-10 pr-3"
        aria-label="Global search"
      />
      {open && (q.trim().length >= 2 || loading) && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-auto rounded-xl border border-slate-300/80 bg-white py-2 shadow-lg backdrop-blur-xl dark:border-white/12 dark:bg-elevated dark:shadow-panel">
          {loading && (
            <p className="px-4 py-3 text-xs text-slate-500 dark:text-gray-400">Searching…</p>
          )}
          {!loading && data && (
            <>
              {(data.members?.length ?? 0) === 0 &&
                (data.leads?.length ?? 0) === 0 &&
                (data.payments?.length ?? 0) === 0 && (
                  <p className="px-4 py-3 text-xs text-slate-500 dark:text-gray-400">No matches</p>
                )}
              {data.members?.map((m) => (
                <Link
                  key={m._id}
                  to={`/app/members/${m._id}`}
                  className="block px-4 py-2.5 transition hover:bg-gf-canvasHover dark:hover:bg-white/[0.08]"
                  onClick={() => setOpen(false)}
                >
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {m.userId?.name}
                  </span>
                  <span className="ml-2 text-xs text-slate-500 dark:text-gray-400">
                    {m.userId?.email}
                  </span>
                </Link>
              ))}
              {data.leads?.map((l) => (
                <div
                  key={l._id}
                  className="px-4 py-2.5 text-sm text-slate-700 hover:bg-gf-canvas dark:text-gray-200 dark:hover:bg-white/[0.08]"
                >
                  Lead: {l.name}{' '}
                  <span className="text-xs text-slate-500 dark:text-gray-400">{l.phone}</span>
                </div>
              ))}
              {data.payments?.map((p) => (
                <div key={p._id} className="px-4 py-2 text-xs text-slate-500 dark:text-gray-400">
                  {p.invoiceNumber} · ₹{p.amount}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
