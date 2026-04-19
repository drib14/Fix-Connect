import React from 'react';
import { Button } from '../components/ui/button';

export function AdminDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-3xl font-bold mb-4 text-primary">Admin Dashboard</h2>
      <p className="text-muted-foreground mb-8">This is a placeholder for the Admin interface.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="p-6 border border-border/50 rounded-xl bg-card/40 flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-white">---</p>
        </div>
        <div className="p-6 border border-border/50 rounded-xl bg-card/40 flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-2">Total Workers</h3>
            <p className="text-3xl font-bold text-white">---</p>
        </div>
        <div className="p-6 border border-border/50 rounded-xl bg-card/40 flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-2">Total Bookings</h3>
            <p className="text-3xl font-bold text-white">---</p>
        </div>
      </div>
    </div>
  );
}
