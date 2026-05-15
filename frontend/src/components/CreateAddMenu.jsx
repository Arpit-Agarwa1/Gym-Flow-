import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Primary “Create / Add” control with quick links (Gymshim-style accent).
 */
export default function CreateAddMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const itemCls =
    'block rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-gf-canvasHover hover:text-slate-900 dark:text-gray-200 dark:hover:bg-white/[0.08] dark:hover:text-white';

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/25 transition hover:brightness-110 active:scale-[0.99] dark:shadow-black/40"
        style={{ background: '#ef4035' }}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="text-lg leading-none font-light">+</span>
        Create / Add
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-300/80 bg-white/98 py-1 shadow-lg backdrop-blur-xl ring-1 ring-slate-900/[0.06] dark:border-white/12 dark:bg-elevated dark:shadow-panel dark:ring-white/[0.08]"
          role="menu"
        >
          <Link
            to="/app/members?add=1"
            className={itemCls}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Add member
          </Link>
          <Link
            to="/app"
            className={itemCls}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Add inquiry / lead
          </Link>
          <Link
            to="/app/classes"
            className={itemCls}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Schedule class / appointment
          </Link>
          <Link
            to="/app/expense"
            className={itemCls}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Record expense
          </Link>
          <Link
            to="/app/contents"
            className={itemCls}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            New gym content
          </Link>
        </div>
      )}
    </div>
  );
}
