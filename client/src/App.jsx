import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './components/AuthScreen';
import AdminPortal from './components/AdminPortal';

function AppContent() {
  const { user, loading, login } = useAuth();

  const handleDemoLogin = async (email, password) => {
    try {
      await login(email, password);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-sm font-bold font-display tracking-widest uppercase text-slate-400">Connecting Fix-Connect...</h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative select-none">
      {!user ? (
        <div className="w-full flex items-center justify-center min-h-screen py-12">
          <AuthScreen onDemoLogin={handleDemoLogin} />
        </div>
      ) : (
        <div className="w-full h-screen">
          <AdminPortal />
        </div>
      )}
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
