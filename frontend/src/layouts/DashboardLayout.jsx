import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster, toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import FeatureNarrationBar from '../components/FeatureNarrationBar.jsx';

/**
 * Shell layout: sidebar + top bar + Socket.io listener for live alerts.
 */
export default function DashboardLayout() {
  const { user, token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!token || !user?._id) return undefined;
    const base =
      import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') ||
      'http://localhost:5000';
    const socket = io(base, { transports: ['websocket'] });
    socket.emit('joinUser', user._id);
    socket.on('notification', (payload) => {
      if (payload?.message) {
        toast(payload.message, { icon: '🔔' });
      }
    });
    return () => socket.disconnect();
  }, [token, user?._id]);

  return (
    <div className="flex min-h-screen bg-ink">
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: '#1a1d21',
            color: '#e5e7eb',
            border: '1px solid rgba(255,255,255,0.08)',
          },
        }}
      />
      <Sidebar />
      <div className="flex flex-1 flex-col lg:pl-64">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 pb-28 md:p-8 md:pb-32">
          <Outlet />
        </main>
        <FeatureNarrationBar variant="app" />
      </div>
    </div>
  );
}
