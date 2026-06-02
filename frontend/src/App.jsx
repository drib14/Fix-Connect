import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { checkAuthMe, setCredentials } from './store/authSlice.js';
import { fetchCurrencyRates, detectUserCurrency } from './store/currencySlice.js';
import { addNotification } from './store/notificationSlice.js';
import { updateBookingInList } from './store/bookingSlice.js';
import { initSocket, disconnectSocket } from './socket.js';

// Components & Pages
import Splash from './components/Splash.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import AccountSwitchBanner from './components/AccountSwitchBanner.jsx';

import Landing from './pages/Landing.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Legal from './pages/Legal.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import ProviderDashboard from './pages/ProviderDashboard.jsx';
import Profile from './pages/Profile.jsx';
import BookingFlow from './pages/BookingFlow.jsx';
import BookingDetail from './pages/BookingDetail.jsx';
import Chat from './pages/Chat.jsx';
import Notifications from './pages/Notifications.jsx';

// Auth-only routes that are public-facing
const PUBLIC_ROUTES = ['/', '/login', '/register', '/verify-email', '/forgot-password', '/reset-password', '/legal'];

export const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { accessToken, user } = useSelector((state) => state.auth);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  // ── Session Restoration ──────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      if (accessToken) {
        try {
          await dispatch(checkAuthMe(accessToken)).unwrap();
        } catch (_) {}
        finally { setTimeout(() => setIsRestoringSession(false), 1000); }
      } else {
        try {
          const response = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
          const data = await response.json();
          if (response.ok && data.data?.accessToken) {
            const userResponse = await fetch('/api/auth/me', {
              headers: { 'Authorization': `Bearer ${data.data.accessToken}` },
            });
            const userData = await userResponse.json();
            if (userResponse.ok) {
              dispatch(setCredentials({ accessToken: data.data.accessToken, user: userData.data.user }));
            }
          }
        } catch (_) {}
        finally { setTimeout(() => setIsRestoringSession(false), 1000); }
      }
    };
    restoreSession();
  }, [dispatch]);

  // ── Currency Bootstrap ────────────────────────────────────
  useEffect(() => {
    dispatch(fetchCurrencyRates());
    dispatch(detectUserCurrency());
  }, [dispatch]);

  // ── Socket.IO Real-time Setup ─────────────────────────────
  useEffect(() => {
    if (accessToken && user) {
      const socket = initSocket(accessToken);

      // Global notification listener
      socket.on('new-notification', (notification) => {
        dispatch(addNotification(notification));
      });

      // Global booking update listener
      socket.on('booking-updated', (data) => {
        dispatch(updateBookingInList(data));
      });

      // Show account switch banner on fresh login
      setShowBanner(true);
    } else {
      disconnectSocket();
    }

    return () => {
      if (!accessToken) disconnectSocket();
    };
  }, [accessToken, user, dispatch]);

  if (isRestoringSession) return <Splash />;

  const isPublicRoute = PUBLIC_ROUTES.some(r => location.pathname === r || location.pathname.startsWith('/reset-password'));

  // Dashboard routing based on role
  const DashboardPage = user?.role === 'provider' ? ProviderDashboard : CustomerDashboard;

  return (
    <div className="app-container">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e1e2e', color: '#e2e8f0', border: '1px solid #334155', borderRadius: '10px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      {/* Account Switch Banner (shown after login) */}
      {accessToken && showBanner && (
        <AccountSwitchBanner onDismiss={() => setShowBanner(false)} />
      )}

      {/* Navbar — shown when authenticated */}
      {accessToken && user?.isOnboarded && <Navbar />}

      <Routes>
        {/* ── Landing / Home ── */}
        <Route
          path="/"
          element={
            accessToken
              ? user?.isOnboarded ? <Home /> : <Navigate to="/onboarding" replace />
              : <Landing />
          }
        />

        {/* ── Onboarding ── */}
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

        {/* ── Dashboard ── */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

        {/* ── Booking Flow ── */}
        <Route path="/book" element={<ProtectedRoute><BookingFlow /></ProtectedRoute>} />
        <Route path="/booking/:id" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />

        {/* ── Profile ── */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* ── Chat ── */}
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

        {/* ── Notifications ── */}
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        {/* ── Public Auth Routes ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/legal" element={<Legal />} />

        {/* ── Wildcard ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
