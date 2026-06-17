import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './components/AuthScreen';
import MobileShell from './components/MobileShell';
import UserPortal from './components/UserPortal';
import WorkerPortal from './components/WorkerPortal';
import AdminPortal from './components/AdminPortal';
import { Shield, Hammer, Users, RefreshCw, Layers } from 'lucide-react';

function AppContent() {
  const { user, loading, login, register, logout } = useAuth();

  // Override view toggle for sandbox testing
  // 'auto' matches user role, or overrides to 'admin', 'user-mobile', 'worker-mobile'
  const [viewportMode, setViewportMode] = useState('auto');
  const [activeMode, setActiveMode] = useState('user-mobile');

  // Resolve current active viewport view based on override or user role
  useEffect(() => {
    if (user) {
      if (viewportMode === 'auto') {
        if (user.role === 'ADMIN') setActiveMode('admin');
        else if (user.role === 'WORKER') setActiveMode('worker-mobile');
        else setActiveMode('user-mobile');
      } else {
        setActiveMode(viewportMode);
      }
    } else {
      setActiveMode('auth');
    }
  }, [user, viewportMode]);

  const handleDemoLogin = async (email, password) => {
    try {
      const loggedUser = await login(email, password);
      // Automatically set viewport to match role on demo login
      setViewportMode('auto');
    } catch (err) {
      // If mock login fails, try to automatically register that seed account on the fly!
      // This is a super robust failsafe for clean setup.
      try {
        let role = 'USER';
        let fullName = 'Demo Client';
        let phone = '09123456789';

        if (email.startsWith('admin')) {
          role = 'ADMIN';
          fullName = 'System Operator';
          phone = '09000000000';
        } else if (email.startsWith('plumber')) {
          role = 'WORKER';
          fullName = 'Mario Plumber';
          phone = '09987654321';
        }

        await register(fullName, email, phone, password, role);
        setViewportMode('auto');
      } catch (regErr) {
        throw new Error('Demo account login failed. Please register manually.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-sm font-bold font-display tracking-widest uppercase">Connecting Fix-Connect...</h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative select-none">

      {/* Floating Developer Sandbox Toolbar */}
      {user && (
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-2 flex items-center justify-between text-xs text-slate-300 z-50 shadow-md">
          <div className="flex items-center space-x-3 text-left">
            <span className="flex items-center text-amber-500 font-bold tracking-wide uppercase text-[10px]">
              <Layers className="w-3.5 h-3.5 mr-1" />
              Dev Sandbox Switcher
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Active User: <b className="text-slate-200">{user.fullName}</b> ({user.role})
            </span>
          </div>

          {/* Selector options */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewportMode('admin')}
              className={`flex items-center px-2.5 py-1 rounded-lg font-semibold border transition cursor-pointer ${activeMode === 'admin'
                  ? 'bg-primary-600 text-white border-primary-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
            >
              <Shield className="w-3 h-3 mr-1" />
              Admin Portal
            </button>
            <button
              onClick={() => setViewportMode('user-mobile')}
              className={`flex items-center px-2.5 py-1 rounded-lg font-semibold border transition cursor-pointer ${activeMode === 'user-mobile'
                  ? 'bg-primary-600 text-white border-primary-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
            >
              <Users className="w-3 h-3 mr-1" />
              User App
            </button>
            <button
              onClick={() => setViewportMode('worker-mobile')}
              className={`flex items-center px-2.5 py-1 rounded-lg font-semibold border transition cursor-pointer ${activeMode === 'worker-mobile'
                  ? 'bg-primary-600 text-white border-primary-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
            >
              <Hammer className="w-3 h-3 mr-1" />
              Worker App
            </button>

            {viewportMode !== 'auto' && (
              <button
                onClick={() => setViewportMode('auto')}
                className="p-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-amber-500 rounded-lg transition cursor-pointer"
                title="Reset to role default"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Render Viewport Content */}
      <div className="flex-1 w-full flex items-center justify-center overflow-auto">
        {!user ? (
          <div className="w-full flex items-center justify-center min-h-[calc(100vh-40px)] py-12">
            <AuthScreen onDemoLogin={handleDemoLogin} />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6 min-h-[calc(100vh-40px)]">

            {/* VIEWPORT: ADMIN DASHBOARD */}
            {activeMode === 'admin' && (
              <div className="w-full h-[calc(100vh-80px)] rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                <AdminPortal />
              </div>
            )}

            {/* VIEWPORT: USER MOBILE APP */}
            {activeMode === 'user-mobile' && (
              <div className="animate-fade-in py-4">
                {user.role !== 'USER' && (
                  <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] rounded-xl font-bold max-w-sm mx-auto text-center leading-normal">
                    ⚠️ Simulating Client View as <b>{user.role}</b>. Some functions may be restricted.
                  </div>
                )}
                <MobileShell title="Fix-Connect Client">
                  <UserPortal />
                </MobileShell>
              </div>
            )}

            {/* VIEWPORT: WORKER MOBILE APP */}
            {activeMode === 'worker-mobile' && (
              <div className="animate-fade-in py-4">
                {user.role !== 'WORKER' && (
                  <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] rounded-xl font-bold max-w-sm mx-auto text-center leading-normal">
                    ⚠️ Simulating Worker View as <b>{user.role}</b>. Some functions may be restricted.
                  </div>
                )}
                <MobileShell title="Fix-Connect Partner">
                  <WorkerPortal />
                </MobileShell>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
