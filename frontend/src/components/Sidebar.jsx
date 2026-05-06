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
        ? 'bg-neon/14 text-neon shadow-[inset_0_0_0_1px_rgba(57,255,20,0.28)] shadow-glow'
        : 'text-gray-400 hover:bg-white/[0.06] hover:text-white',
    ].join(' ');

  return (
    <aside className="fixed left-4 top-4 z-40 hidden h-[calc(100vh-2rem)] w-64 flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-charcoal/90 shadow-panel backdrop-blur-xl lg:flex">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neon/[0.04] to-transparent" />

      <Link
        to="/app"
        className="relative flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-5 py-5 outline-none ring-offset-2 ring-offset-charcoal focus-visible:ring-2 focus-visible:ring-neon"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-neon/35 via-neon/10 to-transparent ring-1 ring-neon/30">
          <span className="text-sm font-bold tracking-tight text-neon">GF</span>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neon/90">
            GymFlow
          </p>
          <p className="text-base font-semibold tracking-tight text-white">
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
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
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
          <div className="border-t border-white/[0.06] pt-4">
            <NavLink to="/app/admin" className={linkClass}>
              Advanced ops
            </NavLink>
          </div>
        )}
      </nav>

      <div className="relative shrink-0 border-t border-white/[0.06] px-4 py-3">
        <p className="text-[11px] leading-snug text-gray-600">
          Neon glass UI · role-based modules
        </p>
      </div>
    </aside>
  );
}
