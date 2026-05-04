import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

/**
 * Command-style search across members, leads, and invoice numbers (manager API).
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
    <div ref={wrapRef} className="relative hidden max-w-md flex-1 md:block">
      <input
        type="search"
        placeholder="Search members, leads, invoices…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full rounded-lg border border-white/10 bg-charcoal py-2 pl-3 pr-3 text-sm text-white placeholder:text-gray-600 focus:border-neon/40 focus:outline-none"
      />
      {open && (q.trim().length >= 2 || loading) && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-auto rounded-xl border border-white/10 bg-charcoal py-2 shadow-xl">
          {loading && (
            <p className="px-3 py-2 text-xs text-gray-500">Searching…</p>
          )}
          {!loading && data && (
            <>
              {(data.members?.length ?? 0) === 0 &&
                (data.leads?.length ?? 0) === 0 &&
                (data.payments?.length ?? 0) === 0 && (
                  <p className="px-3 py-2 text-xs text-gray-500">
                    No matches
                  </p>
                )}
              {data.members?.map((m) => (
                <Link
                  key={m._id}
                  to={`/app/members/${m._id}`}
                  className="block px-3 py-2 text-sm hover:bg-white/5"
                  onClick={() => setOpen(false)}
                >
                  <span className="text-white">{m.userId?.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {m.userId?.email}
                  </span>
                </Link>
              ))}
              {data.leads?.map((l) => (
                <div
                  key={l._id}
                  className="px-3 py-2 text-sm text-gray-300 hover:bg-white/5"
                >
                  Lead: {l.name}{' '}
                  <span className="text-xs text-gray-500">{l.phone}</span>
                </div>
              ))}
              {data.payments?.map((p) => (
                <div key={p._id} className="px-3 py-2 text-xs text-gray-400">
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
