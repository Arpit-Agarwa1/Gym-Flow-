import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice.js';
import GlobalSearch from './GlobalSearch.jsx';
import MobileNavDrawer from './MobileNavDrawer.jsx';

/**
 * Top bar: global search, account actions. Below `lg`, menu opens mobile drawer.
 */
export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const initials =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    '?';

  return (
    <>
      <MobileNavDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <header className="sticky top-0 z-30 flex flex-col gap-3 rounded-2xl border border-slate-300/70 bg-white/90 px-3 py-3 shadow-sm backdrop-blur-xl sm:px-4 md:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4 dark:border-white/12 dark:bg-charcoal dark:shadow-panel-sm">
        {/* Mobile / tablet: toolbar row */}
        <div className="flex items-center justify-between gap-2 lg:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300/80 bg-white text-slate-800 hover:bg-gf-canvasHover dark:border-white/15 dark:bg-elevated dark:text-white dark:hover:bg-white/[0.1]"
              aria-label="Open navigation menu"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(true)}
            >
              <span className="sr-only">Menu</span>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neon/30 to-neon/5 ring-1 ring-neon/25">
              <span className="text-xs font-bold text-neon">GF</span>
            </div>
            <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              GymFlow
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <NavLink
              to="/app/settings"
              className="rounded-xl border border-slate-300/80 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-neon/30 hover:bg-gf-canvasHover dark:border-white/15 dark:bg-white/[0.06] dark:text-gray-100 dark:hover:border-neon/35 dark:hover:bg-white/[0.1]"
            >
              Settings
            </NavLink>
            <button
              type="button"
              onClick={() => {
                dispatch(logout());
                navigate('/login');
              }}
              className="rounded-xl border border-slate-300/80 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-red-300 hover:text-red-600 hover:bg-gf-canvasHover dark:border-white/15 dark:bg-white/[0.06] dark:text-gray-100 dark:hover:border-red-400/40 dark:hover:text-red-300"
            >
              Log out
            </button>
          </div>
        </div>

        <GlobalSearch />

        {/* Desktop: user block */}
        <div className="hidden items-center justify-end gap-3 md:gap-4 lg:flex lg:w-auto">
          <div className="hidden items-center gap-3 sm:flex">
            <div className="hidden text-right md:block">
              <p className="max-w-[200px] truncate text-xs font-medium text-slate-900 dark:text-white">
                {user?.name || 'Staff'}
              </p>
              <p className="max-w-[200px] truncate text-[11px] text-slate-500 dark:text-gray-400">
                {user?.role} · {user?.email}
              </p>
            </div>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 text-sm font-semibold text-emerald-700 ring-1 ring-slate-300/80 dark:from-white/12 dark:to-white/[0.02] dark:text-neon dark:ring-white/10"
              aria-hidden
            >
              {initials}
            </div>
          </div>
          <NavLink
            to="/app/settings"
            className="btn-ghost hidden text-xs sm:inline-flex sm:text-sm lg:inline-flex"
          >
            Settings
          </NavLink>
          <button
            type="button"
            onClick={() => {
              dispatch(logout());
              navigate('/login');
            }}
            className="btn-ghost hidden text-xs sm:inline-flex sm:text-sm lg:inline-flex"
          >
            Log out
          </button>
        </div>
      </header>
    </>
  );
}
