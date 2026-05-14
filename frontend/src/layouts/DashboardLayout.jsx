import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster, toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import FeatureNarrationBar from '../components/FeatureNarrationBar.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';

/**
 * Shell layout: floating sidebar + glass main column + Socket.io toasts.
 * Socket connects on the next macrotask so React 18 Strict Mode’s extra unmount
 * runs before connect — avoids “WebSocket closed before connection” noise in dev.
 */
export default function DashboardLayout() {
  const { user, token } = useSelector((s) => s.auth);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!token || !user?._id) return undefined;
    const apiUrl = import.meta.env.VITE_API_URL?.trim();
    const base =
      apiUrl?.replace(/\/api\/?$/, '') ||
      (import.meta.env.DEV ? 'http://localhost:5000' : null);

    if (!base) {
      console.warn(
        '[GymFlow] VITE_API_URL is not set — Socket.io notifications disabled until the API URL is configured.'
      );
      return undefined;
    }

    const socket = io(base, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
    });

    /** @param {{ message?: string }} payload */
    const onNotification = (payload) => {
      if (payload?.message) {
        toast(payload.message, { icon: '🔔' });
      }
    };
    socket.on('notification', onNotification);

    const connectTimer = window.setTimeout(() => {
      socket.connect();
      socket.emit('joinUser', user._id);
    }, 0);

    return () => {
      window.clearTimeout(connectTimer);
      socket.off('notification', onNotification);
      socket.disconnect();
    };
  }, [token, user?._id]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-ink dark:bg-mesh-ink">
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: isDark ? '#1a1d21' : '#ffffff',
            color: isDark ? '#e5e7eb' : '#0f172a',
            border: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15,23,42,0.12)',
            borderRadius: '12px',
            boxShadow: isDark
              ? '0 16px 40px rgba(0,0,0,0.45)'
              : '0 16px 40px rgba(15,23,42,0.12)',
          },
        }}
      />

      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-[calc(16rem+2rem)]">
        <div className="flex min-w-0 flex-1 flex-col gap-4 px-3 pb-28 pt-3 sm:gap-5 sm:px-4 sm:pb-32 sm:pt-4 md:px-6 md:pb-36 lg:px-8 lg:pt-6">
          <Navbar />
          <main className="dashboard-scroll max-w-full flex-1 overflow-x-auto overflow-y-auto rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm backdrop-blur-xl ring-1 ring-slate-900/[0.04] sm:p-6 md:p-8 dark:border-white/[0.07] dark:bg-charcoal/65 dark:shadow-panel dark:ring-white/[0.03] lg:min-h-[calc(100vh-8.5rem)]">
            <Outlet />
          </main>
        </div>
      </div>

      <FeatureNarrationBar variant="app" />
    </div>
  );
}
