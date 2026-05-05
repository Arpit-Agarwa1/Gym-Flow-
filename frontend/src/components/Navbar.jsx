import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice.js';
import GlobalSearch from './GlobalSearch.jsx';

/**
 * Top bar: glass surface, global search, account actions.
 */
export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const initials =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    '?';

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-charcoal/75 px-4 py-3 shadow-panel-sm backdrop-blur-xl md:px-6">
      <div className="flex min-w-0 items-center gap-3 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon/30 to-neon/5 ring-1 ring-neon/25">
          <span className="text-xs font-bold text-neon">GF</span>
        </div>
        <span className="truncate text-sm font-semibold text-white">
          GymFlow
        </span>
      </div>

      <GlobalSearch />

      <div className="flex w-full items-center justify-end gap-3 sm:w-auto md:gap-4">
        <div className="hidden items-center gap-3 sm:flex">
          <div className="hidden text-right md:block">
            <p className="max-w-[200px] truncate text-xs font-medium text-white">
              {user?.name || 'Staff'}
            </p>
            <p className="max-w-[200px] truncate text-[11px] text-gray-500">
              {user?.role} · {user?.email}
            </p>
          </div>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/12 to-white/[0.02] text-sm font-semibold text-neon ring-1 ring-white/10"
            aria-hidden
          >
            {initials}
          </div>
        </div>
        <NavLink
          to="/app/settings"
          className="btn-ghost hidden text-xs sm:inline-flex sm:text-sm"
        >
          Settings
        </NavLink>
        <button
          type="button"
          onClick={() => {
            dispatch(logout());
            navigate('/login');
          }}
          className="btn-ghost text-xs sm:text-sm"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
