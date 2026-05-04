import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice.js';
import GlobalSearch from './GlobalSearch.jsx';

/** Top bar with account menu */
export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-ink/80 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <span className="text-sm font-semibold text-white">GymFlow</span>
      </div>
      <GlobalSearch />
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-gray-400 sm:inline">
          {user?.role} · {user?.email}
        </span>
        <NavLink
          to="/app/settings"
          className="text-sm text-neon hover:text-white"
        >
          Settings
        </NavLink>
        <button
          type="button"
          onClick={() => {
            dispatch(logout());
            navigate('/login');
          }}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-gray-200 hover:border-neon/40 hover:text-neon"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
