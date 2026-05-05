import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster, toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import FeatureNarrationBar from '../components/FeatureNarrationBar.jsx';

/**
 * Shell layout: floating sidebar + glass main column + Socket.io toasts.
 */
export default function DashboardLayout() {
  const { user, token } = useSelector((s) => s.auth);

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
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
    });
    socket.emit('joinUser', user._id);
    socket.on('notification', (payload) => {
      if (payload?.message) {
        toast(payload.message, { icon: '🔔' });
      }
    });
    return () => socket.disconnect();
  }, [token, user?._id]);

  return (
    <div className="min-h-screen bg-ink bg-mesh-ink">
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: '#1a1d21',
            color: '#e5e7eb',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
          },
        }}
      />

      <Sidebar />

      <div className="flex min-h-screen flex-col lg:pl-[calc(16rem+2rem)]">
        <div className="flex flex-1 flex-col gap-5 px-4 pb-32 pt-4 md:px-8 md:pb-36 md:pt-6">
          <Navbar />
          <main className="dashboard-scroll flex-1 overflow-auto rounded-2xl border border-white/[0.07] bg-charcoal/65 p-6 shadow-panel backdrop-blur-xl md:p-8 lg:min-h-[calc(100vh-8.5rem)] ring-1 ring-white/[0.03]">
            <Outlet />
          </main>
        </div>
      </div>

      <FeatureNarrationBar variant="app" />
    </div>
  );
}
