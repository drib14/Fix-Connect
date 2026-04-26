import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { NotificationsDropdown } from '../components/NotificationsDropdown';
import { WorkerJobPool } from '../components/WorkerJobPool';
import { AdminDashboard } from '../components/AdminDashboard';
import { CustomerHome } from '../components/CustomerHome';
import { WorkerHome } from '../components/WorkerHome';
import { useSocket } from '../contexts/SocketContext';
import { Loader2, Map as MapIcon, List as ListIcon, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const socket = useSocket();
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [loading, setLoading] = useState(!userRole); // Don't show loading if we already have a role from localStorage

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userRes = await axios.get(`/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserRole(userRes.data.role);
      setUser(userRes.data);
      localStorage.setItem('user', JSON.stringify(userRes.data));
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
        setLoading(false);
    }
  };

  const getInitials = () => {
    if (user && user.firstName && user.lastName) {
        return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user && user.firstName) {
        return user.firstName.charAt(0).toUpperCase();
    }
    return 'USER';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/landing');
  };

  return (
    <div className="h-screen bg-background dark text-foreground flex flex-col overflow-hidden relative">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-center z-[1000] pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-border/50 shadow-lg">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden p-1">
            <img src="/FC-logo.png" alt="FixConnect Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="font-bold tracking-tight text-white hidden sm:block">FixConnect</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto bg-background/80 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full border border-border/50 shadow-lg">
          {userRole !== 'admin' && (
            <>
                <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors flex items-center gap-1">
                    <MapIcon className="w-4 h-4" /> <span className="hidden sm:inline">Map</span>
                </Link>
                <Link to="/bookings" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors flex items-center gap-1">
                    <ListIcon className="w-4 h-4" /> <span className="hidden sm:inline">Bookings</span>
                </Link>
            </>
          )}
          <NotificationsDropdown />
          <Link to="/profile" className="flex items-center gap-2 hover:bg-emerald-500/10 px-1 py-1 rounded-full transition-colors" title="Profile">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg overflow-hidden">
                  {localStorage.getItem('userAvatar') || user?.avatar ? (
                      <img src={localStorage.getItem('userAvatar') || user?.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                      <img src={`https://ui-avatars.com/api/?name=${getInitials()}&background=10b981&color=fff`} alt="Profile" className="w-full h-full object-cover" />
                  )}
              </div>
              <span className="text-sm font-medium text-emerald-400 hidden sm:block pr-2">Profile</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 sm:px-3">
              <span className="hidden sm:inline">Logout</span>
              <LogOut className="sm:hidden w-4 h-4" />
          </Button>
        </div>
      </nav>

      {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 w-full h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      ) : (
      <main className="w-full flex-1 flex flex-col items-center relative z-0">
        {userRole === 'admin' ? (
            <div className="pt-24"><AdminDashboard /></div>
        ) : userRole === 'worker' ? (
            <WorkerHome />
        ) : (
            <CustomerHome />
        )}
      </main>
      )}
    </div>
  );
}
