import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { labels: { color: '#9ca3af' } },
  },
  scales: {
    x: {
      ticks: { color: '#9ca3af' },
      grid: { color: 'rgba(255,255,255,0.06)' },
    },
    y: {
      ticks: { color: '#9ca3af' },
      grid: { color: 'rgba(255,255,255,0.06)' },
    },
  },
};

/** Home dashboard with widgets + Chart.js */
export default function Dashboard() {
  const dispatch = useDispatch();
  const { widgets, charts, loading, error } = useSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchOverview());
  }, [dispatch]);

  if (loading && !widgets) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-24 rounded-2xl bg-white/[0.04]" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/35 bg-red-500/[0.07] p-5 text-sm text-red-200 shadow-panel-sm">
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

  const chartShell = 'rounded-2xl border border-white/[0.08] bg-ink/40 p-5 shadow-panel-sm ring-1 ring-white/[0.03]';

  return (
    <div className="space-y-10">
      <PageHeader
        title="Overview"
        subtitle="Quick snapshot of members, renewals, and revenue — updated from your live MongoDB data."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={chartShell}>
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-white">
            Revenue trend
          </h2>
          <Line data={revenueData} options={chartOptions} />
        </div>
        <div className={chartShell}>
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-white">
            Membership growth
          </h2>
          <Bar data={memberGrowth} options={chartOptions} />
        </div>
      </div>

      <div className={chartShell}>
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-white">
          Attendance (recent days)
        </h2>
        <Line data={attendanceData} options={chartOptions} />
      </div>
    </div>
  );
}
