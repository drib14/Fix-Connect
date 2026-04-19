import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { useSocket } from '../contexts/SocketContext';
import { Loader2 } from 'lucide-react';

export function WorkerJobPool() {
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptingId, setAcceptingId] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    fetchAvailableJobs();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('newAvailableJob', (job) => {
        setAvailableJobs(prev => [job, ...prev]);
    });

    socket.on('jobRemoved', (jobId) => {
        setAvailableJobs(prev => prev.filter(job => job._id !== jobId));
    });

    return () => {
        socket.off('newAvailableJob');
        socket.off('jobRemoved');
    };
  }, [socket]);

  const fetchAvailableJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/bookings/available', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableJobs(res.data);
    } catch (err) {
        // If not a worker, it will fail, which is fine, we just don't render it
        console.log("Not a worker or failed to fetch pool");
    } finally {
        setLoading(false);
    }
  };

  const handleAcceptJob = async (id) => {
    setAcceptingId(id);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/bookings/${id}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
          // Socket will handle removal from list
      } else {
          setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept job');
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) return null;
  if (availableJobs.length === 0) return null;

  return (
    <div className="mt-8 border-t border-border/50 pt-8">
      <h2 className="text-2xl font-bold mb-4 text-emerald-400">Available Job Pool</h2>
      {error && <div className="p-3 mb-4 text-sm text-destructive-foreground bg-destructive/90 rounded-md">{error}</div>}
      <div className="grid grid-cols-1 gap-4">
        {availableJobs.map(job => (
            <div key={job._id} className="p-5 border border-emerald-500/30 rounded-xl bg-card/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-lg text-white">{job.serviceCategory}</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                        {new Date(job.date).toLocaleDateString()} at {job.startTime}
                    </p>
                    <p className="text-sm text-muted-foreground">{job.address}</p>
                    <p className="text-sm font-medium mt-1">Payment: {job.paymentMethod}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <p className="font-bold text-lg">₱{job.totalAmount.toFixed(2)}</p>
                    <Button
                        onClick={() => handleAcceptJob(job._id)}
                        disabled={acceptingId === job._id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {acceptingId === job._id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Accept Job
                    </Button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
