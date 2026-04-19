import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function Home() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/landing');
  };

  return (
    <div className="min-h-screen bg-background dark text-foreground p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden p-1">
            <img src="/FC-logo.png" alt="FixConnect Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">FixConnect</span>
        </div>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>

      <div className="max-w-4xl w-full text-center mt-20">
        <h1 className="text-4xl font-bold mb-4">Welcome to FixConnect Dashboard</h1>
        <p className="text-muted-foreground text-lg mb-8">This is where the real-time booking and map interface will go.</p>
        <div className="p-12 border border-border/50 rounded-xl bg-card/30 flex items-center justify-center">
          <p className="text-muted-foreground italic">Map and Job Feed Placeholder</p>
        </div>
      </div>
    </div>
  );
}
