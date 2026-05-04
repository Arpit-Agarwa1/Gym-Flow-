import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { hydrate } from './store/slices/authSlice.js';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Members from './pages/Members.jsx';
import MemberProfile from './pages/MemberProfile.jsx';
import Trainers from './pages/Trainers.jsx';
import Plans from './pages/Plans.jsx';
import Payments from './pages/Payments.jsx';
import Attendance from './pages/Attendance.jsx';
import Workouts from './pages/Workouts.jsx';
import Diets from './pages/Diets.jsx';
import Classes from './pages/Classes.jsx';
import Leads from './pages/Leads.jsx';
import EquipmentPage from './pages/EquipmentPage.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import AdminHub from './pages/AdminHub.jsx';

function PrivateRoute({ children }) {
  const token = useSelector((s) => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(hydrate());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/app"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="members" element={<Members />} />
        <Route path="members/:id" element={<MemberProfile />} />
        <Route path="trainers" element={<Trainers />} />
        <Route path="plans" element={<Plans />} />
        <Route path="payments" element={<Payments />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="workouts" element={<Workouts />} />
        <Route path="diets" element={<Diets />} />
        <Route path="classes" element={<Classes />} />
        <Route path="leads" element={<Leads />} />
        <Route path="equipment" element={<EquipmentPage />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="admin" element={<AdminHub />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
