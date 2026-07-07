import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AppSplashScreen from './components/AppSplashScreen';
import api from './utils/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState(null);

  const checkUserSession = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsInitializing(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      setCurrentPage('dashboard');
    } catch (error) {
      console.warn('Session expired or invalid.');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    checkUserSession();

    // Listen to authorization status updates from api client
    const handleAuthChange = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setCurrentPage('dashboard');
      } else {
        setUser(null);
        setCurrentPage('login');
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  if (isInitializing) {
    return <AppSplashScreen onFinish={() => {}} duration={1500} />;
  }

  return (
    <>
      {currentPage === 'login' && (
        <Login 
          onNavigate={setCurrentPage} 
          onLoginSuccess={(userData) => {
            setUser(userData);
            setCurrentPage('dashboard');
          }} 
        />
      )}
      {currentPage === 'register' && (
        <Register 
          onNavigate={setCurrentPage} 
        />
      )}
      {currentPage === 'forgot-password' && (
        <ForgotPassword 
          onNavigate={setCurrentPage} 
        />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard 
          user={user} 
          onNavigate={setCurrentPage} 
        />
      )}
    </>
  );
}
