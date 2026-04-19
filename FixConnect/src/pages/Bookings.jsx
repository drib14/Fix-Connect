import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useSocket } from '../contexts/SocketContext';
import { ResponsiveModal } from '../components/ResponsiveModal';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelStep, setCancelStep] = useState(1);
  const [cancellingId, setCancellingId] = useState(null);
  const userId = localStorage.getItem('userId');
  const socket = useSocket();

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleStatusUpdate = (updatedBooking) => {
        setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b));
    };
    socket.on('bookingStatusUpdated', handleStatusUpdate);
    socket.on('jobAccepted', handleStatusUpdate);
    return () => {
        socket.off('bookingStatusUpdated', handleStatusUpdate);
        socket.off('jobAccepted', handleStatusUpdate);
    };
  }, [socket]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/bookings/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
        setLoading(false);
    }
  };

  const handleCancelRequest = (id) => {
      setCancellingId(id);
      setCancelStep(1);
      setCancelModalOpen(true);
  };

  const handleNextCancelStep = () => {
      setCancelStep(2);
  };

  const executeCancel = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/bookings/${cancellingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCancelModalOpen(false);
      setCancellingId(null);
      setCancelStep(1);
    } catch (err) {
      console.error("Failed to cancel booking", err);
    }
  };

  return (
    <div className="min-h-screen bg-background dark text-foreground p-6 sm:p-8 flex flex-col items-center">
      <nav className="w-full max-w-4xl mb-8 flex items-center justify-between">
          <Button variant="ghost" asChild><Link to="/">&larr; Back to Map</Link></Button>
          <span className="font-bold text-lg">My Bookings</span>
      </nav>

      <main className="w-full max-w-4xl grid grid-cols-1 gap-4">
            {loading ? (
                <div className="p-12 text-center text-muted-foreground">Loading bookings...</div>
            ) : bookings.length === 0 ? (
                <div className="p-12 border border-border/50 rounded-xl bg-card/30 flex items-center justify-center">
                    <p className="text-muted-foreground italic">No bookings yet.</p>
                </div>
            ) : (
                bookings.map(booking => (
                    <div key={booking._id} className="p-5 border border-border/50 rounded-xl bg-card/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:border-emerald-500/50">
                        <Link to={`/booking/${booking._id}`} className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg text-white hover:text-emerald-400 transition-colors">{booking.serviceCategory}</h3>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                    booking.status === 'accepted' ? 'bg-blue-500/20 text-blue-400' :
                                    booking.status === 'in_progress' ? 'bg-emerald-500/20 text-emerald-400' :
                                    booking.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                    'bg-red-500/20 text-red-400'
                                }`}>
                                    {booking.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                                {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                            </p>
                            <p className="text-sm text-muted-foreground">{booking.address}</p>
                            {booking.workerId && (
                                <p className="text-sm font-medium text-emerald-400 mt-2">Worker: {booking.workerId.name}</p>
                            )}
                        </Link>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                            <p className="font-bold text-lg">₱{booking.totalAmount.toFixed(2)}</p>
                            {(booking.status === 'pending' || booking.status === 'accepted') && (
                                <Button variant="destructive" size="sm" onClick={() => handleCancelRequest(booking._id)}>
                                    Cancel Order
                                </Button>
                            )}
                        </div>
                    </div>
                ))
            )}
      </main>

      <ResponsiveModal
          title={cancelStep === 1 ? "Cancel Booking?" : "Final Confirmation"}
          description={cancelStep === 1 ? "Are you sure you want to cancel this booking?" : "This action cannot be undone and the worker will be notified. Proceed with cancellation?"}
          open={cancelModalOpen}
          onOpenChange={setCancelModalOpen}
      >
          <div className="pt-4 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setCancelModalOpen(false); setCancelStep(1); }}>
                  No, Keep It
              </Button>
              {cancelStep === 1 ? (
                  <Button variant="destructive" className="flex-1" onClick={handleNextCancelStep}>
                      Yes, Cancel
                  </Button>
              ) : (
                  <Button variant="destructive" className="flex-1" onClick={executeCancel}>
                      Confirm Cancel
                  </Button>
              )}
          </div>
      </ResponsiveModal>
    </div>
  );
}
