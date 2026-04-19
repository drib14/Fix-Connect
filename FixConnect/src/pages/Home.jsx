import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { NotificationsDropdown } from '../components/NotificationsDropdown';
import { ResponsiveModal } from '../components/ResponsiveModal';
import { CreateBookingForm } from '../components/CreateBookingForm';
import { WorkerJobPool } from '../components/WorkerJobPool';
import { AdminDashboard } from '../components/AdminDashboard';
import { useSocket } from '../contexts/SocketContext';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const socket = useSocket();
  const [userRole, setUserRole] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchUserDataAndBookings();
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

  const fetchUserDataAndBookings = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch User Role
      const userRes = await axios.get(`/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserRole(userRes.data.role);

      // Fetch Bookings
      if (userRes.data.role !== 'admin') {
          const res = await axios.get(`/api/bookings/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setBookings(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/landing');
  };

  const handleCancelBooking = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/bookings/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Socket event will update the UI automatically
    } catch (err) {
      console.error("Failed to cancel booking", err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
      try {
          const token = localStorage.getItem('token');
          await axios.put(`/api/bookings/${id}/status`, { status }, {
              headers: { Authorization: `Bearer ${token}` }
          });
      } catch (err) {
          console.error("Failed to update status", err);
      }
  };

  return (
    <div className="min-h-screen bg-background dark text-foreground flex flex-col items-center pb-20">
      {/* Navbar */}
      <nav className="w-full max-w-4xl p-6 flex justify-between items-center border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden p-1">
            <img src="/FC-logo.png" alt="FixConnect Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">FixConnect</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors mr-2">
              Profile
          </Link>
          <NotificationsDropdown />
          <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </nav>

      {loading ? (
          <div className="flex flex-col items-center justify-center flex-1">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      ) : (
      <main className="w-full max-w-4xl p-6 flex flex-col gap-8 mt-6">
        {userRole === 'admin' ? (
            <AdminDashboard />
        ) : (
          <>
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
                <p className="text-muted-foreground">Manage your service requests</p>
            </div>

            <ResponsiveModal
                title="Request a Service"
                description="Fill out the details below to find a skilled worker near you."
                open={isBookingModalOpen}
                onOpenChange={setIsBookingModalOpen}
                trigger={<Button className="font-semibold shadow-lg shadow-primary/25">New Booking</Button>}
            >
                <CreateBookingForm
                    onSuccess={(newBooking) => {
                        setIsBookingModalOpen(false);
                        setBookings([newBooking, ...bookings]);
                    }}
                    onCancel={() => setIsBookingModalOpen(false)}
                />
            </ResponsiveModal>
        </div>

        {/* Booking Feed */}
        <div className="grid grid-cols-1 gap-4">
            {bookings.length === 0 ? (
                <div className="p-12 border border-border/50 rounded-xl bg-card/30 flex items-center justify-center">
                    <p className="text-muted-foreground italic">No bookings yet. Create one to get started!</p>
                </div>
            ) : (
                bookings.map(booking => (
                    <div key={booking._id} className="p-5 border border-border/50 rounded-xl bg-card/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg text-white">{booking.serviceCategory}</h3>
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
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <p className="font-bold text-lg">₱{booking.totalAmount.toFixed(2)}</p>
                            {(booking.status === 'pending' || booking.status === 'accepted') && (
                                <Button variant="destructive" size="sm" onClick={() => handleCancelBooking(booking._id)}>
                                    Cancel
                                </Button>
                            )}

                            {/* Worker Actions */}
                            {booking.workerId && booking.workerId.userId === userId && booking.status === 'accepted' && (
                                <Button variant="outline" className="border-emerald-500 text-emerald-500" size="sm" onClick={() => handleUpdateStatus(booking._id, 'in_progress')}>
                                    Start Job
                                </Button>
                            )}
                            {booking.workerId && booking.workerId.userId === userId && booking.status === 'in_progress' && (
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm" onClick={() => handleUpdateStatus(booking._id, 'completed')}>
                                    Mark Completed
                                </Button>
                            )}
                        </div>
                    </div>
                ))
            )}
            </div>

            {userRole === 'worker' && <WorkerJobPool />}
          </>
        )}
      </main>
      )}
    </div>
  );
}
