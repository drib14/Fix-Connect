import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthMe, setCredentials } from './store/authSlice.js';

// Components & Pages
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

export const App = () => {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);

  // Proactive Session Recovery Check on reload
  useEffect(() => {
    const restoreSession = async () => {
      // Look for access token in session storage or state
      if (accessToken) {
        dispatch(checkAuthMe(accessToken));
      } else {
        // Try a silent cookie credentials handshake
        try {
          const response = await fetch('/api/auth/refresh', { method: 'POST' });
          const data = await response.json();
          if (response.ok && data.data?.accessToken) {
            // Restore user credential details
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
          // No active session cookie found, user will log in normally
        }
      }
    };

    restoreSession();
  }, [dispatch, accessToken]);

  return (
    <div className="app-container">
      <Routes>
        {/* Protected Dashboard Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />

        {/* Public Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
