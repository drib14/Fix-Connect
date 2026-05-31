import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Splash from './components/Splash';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import ClientDashboard from './pages/ClientDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Legal from './pages/Legal';
import { Loader } from 'lucide-react';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [showLegal, setShowLegal] = useState(false);

  const API_URL = 'http://localhost:5050/api/auth';

  // Check persistent session on load
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('fixconnect_token');
      if (!token) {
        setLoadingSession(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.error('Session restoration failed:', err.message);
        localStorage.removeItem('fixconnect_token'); // Clean corrupted tokens
      } finally {
        setLoadingSession(false);
      }
    };

    restoreSession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('fixconnect_token');
    setUser(null);
  };

  // 1. Loading Splash Intro
  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  // 2. Loading Session Restore Loader
  if (loadingSession) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg-gradient)',
          color: '#10b981',
          gap: '12px',
        }}
      >
        <Loader size={36} style={{ animation: 'rotateRing 1.5s linear infinite' }} />
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Securing Session Connection...</span>
      </div>
    );
  }

  // 3. Legal pages
  if (showLegal) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', padding: '20px 0' }}>
        <Legal onBack={() => setShowLegal(false)} />
      </div>
    );
  }

  // 4. Authenticated, but Onboarding Incomplete
  if (user && !user.onboardingCompleted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', padding: '20px 0' }}>
        <Onboarding user={user} onOnboardSuccess={(updatedUser) => setUser(updatedUser)} />
      </div>
    );
  }

  // 5. Authenticated & Onboarding Complete -> Dashboard Routing
  if (user && user.onboardingCompleted) {
    if (user.role === 'admin') {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    }
    if (user.role === 'worker') {
      return <WorkerDashboard user={user} onLogout={handleLogout} />;
    }
    return <ClientDashboard user={user} onLogout={handleLogout} />;
  }

  // 6. Public Guest (Not logged in)
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-gradient)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'between',
        paddingBottom: '20px',
      }}
    >
      <Auth onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />
      
      {/* Footer Legal triggers */}
      <footer style={{ textAlign: 'center', padding: '16px' }}>
        <button
          onClick={() => setShowLegal(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '13px',
            cursor: 'pointer',
            textDecoration: 'underline',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.target.style.color = '#10b981')}
          onMouseLeave={(e) => (e.target.style.color = '#64748b')}
        >
          Terms of Service & Privacy Policy Guidelines
        </button>
      </footer>
    </div>
  );
};

export default App;
