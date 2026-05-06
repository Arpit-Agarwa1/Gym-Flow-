import { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CreateAddMenu from './CreateAddMenu.jsx';
import {
  dashboardNavGroups,
  MANAGER_UI_ROLES,
} from '../data/dashboardNav.js';

/**
 * Full-height slide-in navigation for viewports below `lg` (sidebar is desktop-only).
 * @param {{ open: boolean; onClose: () => void }} props
 */
export default function MobileNavDrawer({ open, onClose }) {
  const role = useSelector((s) => s.auth.user?.role);
  const showAdvanced = MANAGER_UI_ROLES.includes(role);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const linkClass = ({ isActive }) =>
    [
      'flex items-center rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-150',
      isActive
        ? 'bg-neon/14 text-neon shadow-[inset_0_0_0_1px_rgba(57,255,20,0.28)]'
        : 'text-gray-400 hover:bg-white/[0.06] hover:text-white',
    ].join(' ');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label="App navigation">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className="absolute left-0 top-0 flex h-full w-[min(100vw-3rem,18rem)] flex-col border-r border-white/10 bg-charcoal/98 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4">
          <Link
            to="/app"
            className="flex items-center gap-2 outline-none"
            onClick={onClose}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon/35 via-neon/10 to-transparent ring-1 ring-neon/30">
              <span className="text-sm font-bold text-neon">GF</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neon/90">
                GymFlow
              </p>
              <p className="text-sm font-semibold text-white">Menu</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 p-2 text-gray-400 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative z-20 shrink-0 overflow-visible border-b border-white/[0.06] px-3 py-3">
          <CreateAddMenu />
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3 dashboard-scroll">
          {dashboardNavGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((l) => (
                  <NavLink
                    key={l.to + l.label}
                    to={l.to}
                    end={l.end}
                    className={linkClass}
                    onClick={onClose}
                  >
                    {l.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
          {showAdvanced && (
            <div className="border-t border-white/[0.06] pt-3">
              <NavLink to="/app/admin" className={linkClass} onClick={onClose}>
                Advanced ops
              </NavLink>
            </div>
          )}
        </nav>
      </aside>
    </div>
  );
}
