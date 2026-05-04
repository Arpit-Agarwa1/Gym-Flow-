import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const MANAGER_UI_ROLES = ['SuperAdmin', 'GymOwner', 'Manager'];

const links = [
  { to: '/app', label: 'Overview', end: true },
  { to: '/app/members', label: 'Members' },
  { to: '/app/trainers', label: 'Trainers' },
  { to: '/app/plans', label: 'Plans' },
  { to: '/app/payments', label: 'Payments' },
  { to: '/app/attendance', label: 'Attendance' },
  { to: '/app/workouts', label: 'Workouts' },
  { to: '/app/diets', label: 'Diet Plans' },
  { to: '/app/classes', label: 'Classes' },
  { to: '/app/leads', label: 'Leads' },
  { to: '/app/equipment', label: 'Equipment' },
  { to: '/app/reports', label: 'Reports' },
  { to: '/app/settings', label: 'Settings' },
];

/** Left navigation — neon accent on active route */
export default function Sidebar() {
  const role = useSelector((s) => s.auth.user?.role);
  const showAdvanced = MANAGER_UI_ROLES.includes(role);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-charcoal/95 backdrop-blur lg:flex">
      <Link
        to="/app"
        className="flex h-16 items-center gap-2 border-b border-white/10 px-6 outline-none ring-offset-2 ring-offset-charcoal focus-visible:ring-2 focus-visible:ring-neon"
      >
        <span className="h-8 w-8 shrink-0 rounded-lg bg-neon/20 ring-1 ring-neon/40" />
        <div>
          <p className="text-xs uppercase tracking-widest text-neon">GymFlow</p>
          <p className="text-sm font-semibold text-white">Operations</p>
        </div>
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              [
                'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-neon/15 text-neon shadow-[inset_0_0_0_1px_rgba(57,255,20,0.25)]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white',
              ].join(' ')
            }
          >
            {l.label}
          </NavLink>
        ))}
        {showAdvanced && (
          <NavLink
            to="/app/admin"
            className={({ isActive }) =>
              [
                'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-neon/15 text-neon shadow-[inset_0_0_0_1px_rgba(57,255,20,0.25)]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white',
              ].join(' ')
            }
          >
            Advanced ops
          </NavLink>
        )}
      </nav>
      <div className="border-t border-white/10 p-4 text-xs text-gray-500">
        GymFlow · dark fitness theme
      </div>
    </aside>
  );
}
