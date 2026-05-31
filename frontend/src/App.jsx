import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Splash from './components/Splash';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import ClientDashboard from './pages/ClientDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Legal from './pages/Legal';
import Footer from './components/Footer';
import { Loader } from 'lucide-react';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  
  // Navigation states
  const [showAuth, setShowAuth] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [initialLegalTab, setInitialLegalTab] = useState('tos');

  const API_URL = 'http://localhost:5000/api/auth';

  // Restore persistent user session on boot
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
        localStorage.removeItem('fixconnect_token'); 
      } finally {
        setLoadingSession(false);
      }
    };

    restoreSession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('fixconnect_token');
    setUser(null);
    setShowAuth(false);
  };

  const handleOpenLegal = (tab = 'tos') => {
    setInitialLegalTab(tab);
    setShowLegal(true);
  };

  // 1. Full-screen Splash Intro on load
  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  // 2. Loading Session Spinner
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

  // 3. Legal guidelines router
  if (showLegal) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', padding: '20px 0' }}>
        <Legal onBack={() => setShowLegal(false)} defaultTab={initialLegalTab} />
      </div>
    );
  }

  // 4. Authenticated with Incomplete Onboarding
  if (user && !user.onboardingCompleted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', padding: '20px 0' }}>
        <Onboarding user={user} onOnboardSuccess={(updatedUser) => setUser(updatedUser)} />
      </div>
    );
  }

  // Content Wrapper
  const renderContent = () => {
    // 5. Authenticated & Onboarded -> Roles Dashboards
    if (user && user.onboardingCompleted) {
      if (user.role === 'admin') {
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      }
      if (user.role === 'worker') {
        return <WorkerDashboard user={user} onLogout={handleLogout} />;
      }
      return <ClientDashboard user={user} onLogout={handleLogout} />;
    }

    // 6. Auth Dialog panel
    if (showAuth) {
      return (
        <div style={{ flexGrow: 1, background: 'var(--bg-gradient)', display: 'flex', flexDirection: 'column' }}>
          <Auth
            onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
            onBackToLanding={() => setShowAuth(false)}
          />
        </div>
      );
    }

    // 7. Public guest homepage (Landing page loaded by default!)
    return (
      <Landing
        onGetStarted={() => setShowAuth(true)}
        onLegalClick={handleOpenLegal}
      />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {renderContent()}
      <Footer />
    </div>
  );
};

export default App;
