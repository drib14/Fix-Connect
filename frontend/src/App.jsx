import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthMe, setCredentials } from './store/authSlice.js';

// Components & Pages
import Splash from './components/Splash.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Landing from './pages/Landing.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Legal from './pages/Legal.jsx';

export const App = () => {
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector((state) => state.auth);
  
  // App-level loading states for splash screen
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (accessToken) {
        try {
          await dispatch(checkAuthMe(accessToken)).unwrap();
        } catch (err) {
          // Access token invalid, reset will trigger
        } finally {
          // Hold splash screen for a short delay (1.2s) for visual aesthetic delight
          setTimeout(() => setIsRestoringSession(false), 1200);
        }
      } else {
        // Try a silent cookie credentials handshake
        try {
          const response = await fetch('/api/auth/refresh', { method: 'POST' });
          const data = await response.json();
          if (response.ok && data.data?.accessToken) {
            const userResponse = await fetch('/api/auth/me', {
              headers: { 'Authorization': `Bearer ${data.data.accessToken}` }
            });
            const userData = await userResponse.json();
            
            if (userResponse.ok) {
              dispatch(setCredentials({
                accessToken: data.data.accessToken,
                user: userData.data.user
              }));
            }
          }
        } catch (err) {
          // Silent refresh failed, user is a guest
        } finally {
          setTimeout(() => setIsRestoringSession(false), 1200);
        }
      }
    };

    restoreSession();
  }, [dispatch, accessToken]);

  if (isRestoringSession) {
    return <Splash />;
  }

  return (
    <div className="app-container">
      <Routes>
        {/* Landing Page (Public Home) */}
        <Route 
          path="/" 
          element={
            accessToken ? (
              user?.isOnboarded ? (
                <Home />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : (
              <Landing />
            )
          } 
        />

        {/* SaaS Onboarding Flow */}
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } 
        />

        {/* Public Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/legal" element={<Legal />} />

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
