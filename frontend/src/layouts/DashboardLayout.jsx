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
    <div className="min-h-screen bg-cream dark:bg-ink dark:bg-mesh-ink">
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: isDark ? '#273F4F' : '#ffffff',
            color: isDark ? '#EFEEEA' : '#273F4F',
            border: isDark
              ? '1px solid rgba(239,238,234,0.12)'
              : '1px solid rgba(39,63,79,0.15)',
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
          <main className="dashboard-scroll max-w-full flex-1 overflow-x-auto overflow-y-auto rounded-2xl border border-slate-300/70 bg-white/95 p-4 shadow-sm backdrop-blur-xl ring-1 ring-slate-900/[0.06] sm:p-6 md:p-8 dark:border-white/12 dark:bg-charcoal dark:shadow-panel dark:ring-white/[0.06] lg:min-h-[calc(100vh-8.5rem)]">
            <Outlet />
          </main>
        </div>
      </div>

      <FeatureNarrationBar variant="app" />
    </div>
  );
}
