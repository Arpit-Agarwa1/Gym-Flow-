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
    return <p className="text-gray-400">Loading dashboard…</p>;
  }
  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-sm text-gray-400">
          Quick snapshot of members, renewals, and revenue.
        </p>
      </div>

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
        <div className="rounded-2xl border border-white/10 bg-charcoal p-4">
          <h2 className="mb-4 text-sm font-semibold text-white">
            Revenue trend
          </h2>
          <Line data={revenueData} options={chartOptions} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-charcoal p-4">
          <h2 className="mb-4 text-sm font-semibold text-white">
            Membership growth
          </h2>
          <Bar data={memberGrowth} options={chartOptions} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-charcoal p-4">
        <h2 className="mb-4 text-sm font-semibold text-white">
          Attendance (recent days)
        </h2>
        <Line data={attendanceData} options={chartOptions} />
      </div>
    </div>
  );
}
