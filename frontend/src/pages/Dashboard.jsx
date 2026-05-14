import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/axios.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { fetchOverview } from '../store/slices/dashboardSlice.js';
import StatCard from '../components/StatCard.jsx';
import PageHeader from '../components/PageHeader.jsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/** INR display for overdue amounts */
function formatInr(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

/** Short labels for payment category on dashboard */
function categoryShort(cat) {
  switch (cat) {
    case 'membership':
      return 'Membership';
    case 'advance_hold':
      return 'Advance / hold';
    case 'personal_training':
      return 'Personal training';
    case 'other':
      return 'Other';
    default:
      return cat ? String(cat).replace(/_/g, ' ') : '—';
  }
}

/**
 * Who collects: always the gym; PT rows name the trainer for revenue credit.
 * @param {{ category?: string; trainerName?: string; trainerId?: unknown }} p
 */
function creditorLine(p) {
  const trainer =
    p.trainerName ||
    (typeof p.trainerId === 'object' && p.trainerId && 'name' in p.trainerId
      ? /** @type {{ name?: string }} */ (p.trainerId).name
      : '') ||
    '';
  if (p.category === 'personal_training' && trainer) {
    return { to: 'Gym', detail: `PT credit: ${trainer}` };
  }
  return { to: 'Gym', detail: '' };
}

const OVERDUE_PREVIEW = 12;

/** Home dashboard with widgets + Chart.js */
export default function Dashboard() {
  const dispatch = useDispatch();
  const { widgets, charts, loading, error } = useSelector((s) => s.dashboard);

  const [overdueRows, setOverdueRows] = useState(/** @type {unknown[]} */ ([]));
  const [overdueLoading, setOverdueLoading] = useState(true);
  const [overdueError, setOverdueError] = useState(/** @type {string | null} */ (null));

  useEffect(() => {
    dispatch(fetchOverview());
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    setOverdueLoading(true);
    setOverdueError(null);
    api
      .get('/payments', { params: { overdue: '1' } })
      .then(({ data }) => {
        if (cancelled) return;
        setOverdueRows(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (cancelled) return;
        setOverdueError('Could not load overdue dues');
        setOverdueRows([]);
      })
      .finally(() => {
        if (!cancelled) setOverdueLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const overdueStats = useMemo(() => {
    const sum = overdueRows.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    return { count: overdueRows.length, sum };
  }, [overdueRows]);

  /** Chart.js colors aligned with the app dark shell (no theme toggle). */
  const chartOptions = useMemo(() => {
    const tick = '#9ca3af';
    const grid = 'rgba(255,255,255,0.06)';
    return {
      responsive: true,
      plugins: {
        legend: { labels: { color: tick } },
      },
      scales: {
        x: {
          ticks: { color: tick },
          grid: { color: grid },
        },
        y: {
          ticks: { color: tick },
          grid: { color: grid },
        },
      },
    };
  }, []);

  if (loading && !widgets) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-24 rounded-2xl bg-slate-200/90 dark:bg-white/[0.06]" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/90 dark:bg-white/[0.06]" />
          ))}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900 shadow-sm dark:border-red-500/35 dark:bg-red-500/[0.07] dark:text-red-200 dark:shadow-panel-sm">
        {error} — make sure you are logged in as staff (owner/manager) and MongoDB
        is running.
      </div>
    );
  }

  const revenueData = {
    labels: charts?.revenueChart?.map((d) => d.label) || [],
    datasets: [
      {
        label: 'Revenue',
        data: charts?.revenueChart?.map((d) => d.value) || [],
        borderColor: '#39ff14',
        backgroundColor: 'rgba(57,255,20,0.15)',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const memberGrowth = {
    labels: charts?.membershipGrowthChart?.map((d) => d.label) || [],
    datasets: [
      {
        label: 'Total members (cumulative)',
        data: charts?.membershipGrowthChart?.map((d) => d.value) || [],
        backgroundColor: 'rgba(57,255,20,0.35)',
      },
    ],
  };

  const attendanceData = {
    labels: charts?.attendanceChart?.map((d) => d.label) || [],
    datasets: [
      {
        label: 'Check-ins',
        data: charts?.attendanceChart?.map((d) => d.value) || [],
        borderColor: '#a3ffb8',
        backgroundColor: 'rgba(163,255,184,0.15)',
        fill: true,
        tension: 0.25,
      },
    ],
  };

  const chartShell =
    'rounded-2xl border border-slate-300/70 bg-white/95 p-5 shadow-sm ring-1 ring-slate-900/[0.06] dark:border-white/12 dark:bg-elevated dark:shadow-panel-sm dark:ring-white/[0.08]';

  return (
    <div className="space-y-10">
      <PageHeader
        title="Overview"
        subtitle="Quick snapshot of members, renewals, and revenue — updated from your live MongoDB data."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total members" value={widgets?.totalMembers ?? '—'} />
        <StatCard label="Active members" value={widgets?.activeMembers ?? '—'} />
        <StatCard label="Expired" value={widgets?.expiredMembers ?? '—'} />
        <StatCard
          label="Revenue today"
          value={`₹${widgets?.revenueToday ?? 0}`}
        />
        <StatCard
          label="Revenue this month"
          value={`₹${widgets?.revenueMonth ?? 0}`}
        />
        <StatCard
          label="New members (7 days)"
          value={widgets?.newMembersThisWeek ?? '—'}
        />
        <StatCard
          label="Overdue pending (count)"
          value={overdueLoading ? '…' : overdueStats.count}
          hint="Pending dues past due date"
        />
        <StatCard
          label="Overdue pending (amount)"
          value={overdueLoading ? '…' : formatInr(overdueStats.sum)}
          hint="Sum owed to the gym"
        />
      </div>

      {/* Who owes whom: member → gym (PT shows trainer credit) */}
      <section className="rounded-2xl border border-red-200/90 bg-red-50/90 p-5 shadow-sm ring-1 ring-red-200/50 dark:border-red-500/25 dark:bg-red-500/[0.04] dark:shadow-panel-sm dark:ring-red-500/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-red-800 dark:text-red-100">
              Overdue collections
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-red-800/85 dark:text-red-100/70">
              <span className="font-medium text-red-900 dark:text-red-100/90">From</span> is the member who still
              owes money. <span className="font-medium text-red-900 dark:text-red-100/90">To</span> is your gym
              (you collect here). Personal training rows also show which{' '}
              <span className="font-medium text-red-900 dark:text-red-100/90">trainer</span> is credited for that
              PT due.
            </p>
          </div>
          <Link
            to="/app/payments?overdue=1"
            className="shrink-0 rounded-lg border border-red-300/80 bg-white px-3 py-2 text-xs font-medium text-red-900 transition hover:bg-red-100 dark:border-white/15 dark:bg-white/[0.08] dark:text-white dark:hover:bg-white/[0.12]"
          >
            Open in Payments
          </Link>
        </div>
        {overdueError ? (
          <p className="mt-4 text-sm text-red-700 dark:text-red-200/80">{overdueError}</p>
        ) : overdueLoading ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-gray-400">Loading overdue list…</p>
        ) : overdueStats.count === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-gray-400">No overdue pending dues. Great.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 dark:divide-white/10">
            {overdueRows.slice(0, OVERDUE_PREVIEW).map((p) => {
              const from =
                p.memberName ||
                (typeof p.memberId === 'object' && p.memberId?.userId?.name) ||
                'Member';
              const { to, detail } = creditorLine(p);
              const dueStr = p.dueDate
                ? new Date(p.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })
                : '—';
              return (
                <li
                  key={p._id}
                  className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm first:pt-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">
                      <span className="text-amber-800 dark:text-amber-200/90">From</span>{' '}
                      <span className="text-slate-900 dark:text-white">{from}</span>
                      <span className="mx-2 text-slate-400 dark:text-gray-400">→</span>
                      <span className="text-emerald-800 dark:text-emerald-200/90">To</span>{' '}
                      <span className="text-slate-900 dark:text-white">{to}</span>
                      {detail ? (
                        <span className="mt-0.5 block text-xs font-normal text-slate-600 dark:text-gray-300">
                          {detail}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">
                      {categoryShort(p.category)} · due {dueStr}
                      {p.invoiceNumber ? ` · ${p.invoiceNumber}` : ''}
                    </p>
                  </div>
                  <p className="shrink-0 tabular-nums font-semibold text-neon">
                    {formatInr(Number(p.amount))}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        {!overdueLoading && !overdueError && overdueStats.count > OVERDUE_PREVIEW ? (
          <p className="mt-3 text-xs text-slate-500 dark:text-gray-400">
            Showing {OVERDUE_PREVIEW} of {overdueStats.count}.{' '}
            <Link to="/app/payments?overdue=1" className="text-neon hover:underline">
              See all in Payments
            </Link>
          </p>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={chartShell}>
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-900 dark:text-white">
            Revenue trend
          </h2>
          <Line data={revenueData} options={chartOptions} />
        </div>
        <div className={chartShell}>
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-900 dark:text-white">
            Membership growth
          </h2>
          <Bar data={memberGrowth} options={chartOptions} />
        </div>
      </div>

      <div className={chartShell}>
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-900 dark:text-white">
          Attendance (recent days)
        </h2>
        <Line data={attendanceData} options={chartOptions} />
      </div>
    </div>
  );
}
