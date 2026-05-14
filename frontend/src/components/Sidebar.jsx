import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CreateAddMenu from './CreateAddMenu.jsx';
import {
  dashboardNavGroups,
  MANAGER_UI_ROLES,
} from '../data/dashboardNav.js';

/**
 * Floating glass sidebar with grouped navigation (large screens only).
 */
export default function Sidebar() {
  const role = useSelector((s) => s.auth.user?.role);
  const showAdvanced = MANAGER_UI_ROLES.includes(role);

  const linkClass = ({ isActive }) =>
    [
      'flex items-center rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150',
      isActive
        ? 'bg-gf-sageSoft text-gf-sageFg shadow-[inset_0_0_0_1px_rgba(15,31,24,0.22)] dark:bg-neon/14 dark:text-neon dark:shadow-[inset_0_0_0_1px_rgba(57,255,20,0.28)] dark:shadow-glow'
        : 'text-slate-600 hover:bg-gf-canvasHover hover:text-slate-900 dark:text-gray-300 dark:hover:bg-white/[0.08] dark:hover:text-white',
    ].join(' ');

  return (
    <aside className="fixed left-4 top-4 z-40 hidden h-[calc(100vh-2rem)] w-64 flex-col overflow-hidden rounded-2xl border border-slate-300/70 bg-white/95 shadow-lg backdrop-blur-xl lg:flex dark:border-white/12 dark:bg-charcoal dark:shadow-panel">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neon/[0.06] to-transparent dark:from-neon/[0.04]" />

      <Link
        to="/app"
        className="relative flex shrink-0 items-center gap-3 border-b border-slate-200 px-5 py-5 outline-none ring-offset-2 ring-offset-white focus-visible:ring-2 focus-visible:ring-neon dark:border-white/12 dark:ring-offset-charcoal"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-neon/35 via-neon/10 to-transparent ring-1 ring-neon/30">
          <span className="text-sm font-bold tracking-tight text-neon">GF</span>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-neon/90">
            GymFlow
          </p>
          <p className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
            Operations
          </p>
        </div>
      </Link>

      <div className="relative shrink-0 px-3 pt-3">
        <CreateAddMenu />
      </div>

      <nav className="relative flex-1 space-y-5 overflow-y-auto px-3 pb-4 pt-2 dashboard-scroll">
        {dashboardNavGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-gray-400">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((l) => (
                <NavLink
                  key={l.to + l.label}
                  to={l.to}
                  end={l.end}
                  className={linkClass}
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
        {showAdvanced && (
          <div className="border-t border-slate-200 pt-4 dark:border-white/12">
            <NavLink to="/app/admin" className={linkClass}>
              Advanced ops
            </NavLink>
          </div>
        )}
      </nav>

      <div className="relative shrink-0 border-t border-slate-200 px-4 py-3 dark:border-white/12">
        <p className="text-[11px] leading-snug text-slate-500 dark:text-gray-400">
          Neon glass UI · role-based modules
        </p>
      </div>
    </aside>
  );
}
