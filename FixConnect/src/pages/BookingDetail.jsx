import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { Button } from '../components/ui/button';
import { ResponsiveModal } from '../components/ResponsiveModal';
import { useSocket } from '../contexts/SocketContext';
import { Loader2, Briefcase, Calendar, MapPin, Wallet, CreditCard, User, CheckCircle2, XCircle, Clock, Map } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"

function getCustomerIcon(user, isPending) {
    let initials = 'USER';
    if (user && user.firstName && user.lastName) {
        initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user && user.firstName) {
        initials = user.firstName.charAt(0).toUpperCase();
    }

    const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${initials}&background=10b981&color=fff`;

    const animationClass = isPending ? 'animate-pulse' : '';

    return new L.DivIcon({
        html: `
            <div class="${animationClass}" style="position: relative; width: 40px; height: 50px; display: flex; flex-direction: column; align-items: center;">
                <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; border: 3px solid #10b981; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); z-index: 2;">
                    <img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                <div style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 12px solid #10b981; margin-top: -4px; z-index: 1; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));"></div>
            </div>
        `,
        className: '',
        iconSize: [40, 50],
        iconAnchor: [20, 50],
        popupAnchor: [0, -50]
    });
}

const getWorkerIcon = () => {
    return new L.DivIcon({
        html: `
            <div style="position: relative; width: 40px; height: 50px; display: flex; flex-direction: column; align-items: center;">
                <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; border: 3px solid #10b981; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); z-index: 2; display: flex; justify-content: center; align-items: center; font-size: 24px;">
                    🤖
                </div>
                <div style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 12px solid #10b981; margin-top: -4px; z-index: 1; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));"></div>
            </div>
        `,
        className: '',
        iconSize: [40, 50],
        iconAnchor: [20, 50],
        popupAnchor: [0, -50]
    });
};

function MapUpdater({ center, zoom = 13 }) {
    const map = useMap();
    const prevCenter = React.useRef(null);
    React.useEffect(() => {
        if (center && (!prevCenter.current || prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1])) {
            map.flyTo(center, zoom, {
                animate: true,
                duration: 1.5
            });
            prevCenter.current = center;
        }
    }, [center, map, zoom]);
    return null;
}

function RoutingMachine({ customerLoc, workerLoc, setEta }) {
    const map = useMap();
    const routingControlRef = React.useRef(null);

    useEffect(() => {
        if (!map || !customerLoc || !workerLoc) return;

        // If it doesn't exist, create it
        if (!routingControlRef.current) {
            const control = L.Routing.control({
                waypoints: [
                    L.latLng(workerLoc.lat, workerLoc.lng),
                    L.latLng(customerLoc.lat, customerLoc.lng)
                ],
                lineOptions: {
                    styles: [{ color: '#10b981', weight: 5, opacity: 0.8 }]
                },
                show: false,
                addWaypoints: false,
                routeWhileDragging: false,
                fitSelectedRoutes: true,
                showAlternatives: false,
                createMarker: () => null // We draw our own markers
            });

            // Critical patch: override the internal line cleanup function which causes the error
            if (control._clearLines) {
                const originalClearLines = control._clearLines.bind(control);
                control._clearLines = function() {
                    // Only remove if map exists and has the layer
                    if (this._line) {
                        try {
                            this._map.removeLayer(this._line);
                        } catch(e) {}
                    }
                    if (this._alternatives && this._alternatives.length) {
                        for (let i in this._alternatives) {
                            try {
                                this._map.removeLayer(this._alternatives[i]);
                            } catch(e) {}
                        }
                    }
                };
            }

            control.on('routesfound', function(e) {
                const routes = e.routes;
                if (routes && routes.length > 0) {
                    const summary = routes[0].summary;
                    if (setEta) {
                        // convert seconds to human readable
                        const totalMinutes = Math.round(summary.totalTime / 60);
                        setEta(totalMinutes > 0 ? `${totalMinutes} min` : '< 1 min');
                    }
                }
            });

            control.addTo(map);
            routingControlRef.current = control;
        } else {
             // If it exists, just set waypoints
             try {
                const currentWaypoints = routingControlRef.current.getWaypoints();
                const start = currentWaypoints[0]?.latLng;
                const end = currentWaypoints[1]?.latLng;

                // Only update if there is a meaningful change in coordinates to prevent excessive API calls
                if (!start || !end || Math.abs(start.lat - workerLoc.lat) > 0.0005 || Math.abs(start.lng - workerLoc.lng) > 0.0005) {
                    routingControlRef.current.setWaypoints([
                        L.latLng(workerLoc.lat, workerLoc.lng),
                        L.latLng(customerLoc.lat, customerLoc.lng)
                    ]);
                }
             } catch (err) {
                 console.warn("Error updating waypoints:", err);
             }
        }

        return () => {
            // We intentionally do NOT destroy it here on every render, only on unmount.
        };
    }, [map, customerLoc, workerLoc, setEta]);

    useEffect(() => {
        // Component fully unmounting
        return () => {
            if (routingControlRef.current) {
                try {
                    // Stop it from making further requests
                    if (routingControlRef.current.getRouter && routingControlRef.current.getRouter()) {
                        routingControlRef.current.getRouter().abort = () => {};
                    }
                    if (map && map.removeControl) {
                        map.removeControl(routingControlRef.current);
                    }
                    // Explicitly nullify to prevent delayed callbacks from trying to add layers
                    routingControlRef.current._map = null;
                    routingControlRef.current._line = null;
                } catch (e) {
                    console.warn("Cleanup error in routing machine", e);
                }
            }
        };
    }, [map]);

    return null;
}

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState(null);
  const [showArrivedModal, setShowArrivedModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Worker Location Broadcaster
  useEffect(() => {
      if (!booking || !socket || booking.status !== 'in_progress') return;

      const userId = localStorage.getItem('userId');
      const isWorker = booking.workerId && booking.workerId.userId === userId;

      if (!isWorker) return;

      let watchId;
      if (navigator.geolocation) {
          watchId = navigator.geolocation.watchPosition(
              (position) => {
                  const lat = position.coords.latitude;
                  const lng = position.coords.longitude;
                  socket.emit('locationUpdate', { bookingId: id, lat, lng });
                  // Also update local state for the worker's own map view
                  setBooking(prev => ({ ...prev, workerLocation: { lat, lng } }));
              },
              (err) => console.error("Error watching position:", err),
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
      }

      return () => {
          if (watchId) navigator.geolocation.clearWatch(watchId);
      };
  }, [booking?.status, booking?.workerId, socket, id]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('joinBookingRoom', id);

    const handleStatusUpdate = (updatedBooking) => {
        if (updatedBooking._id === id) {
            setBooking(prev => {
                if (prev && prev.status !== 'in_progress' && updatedBooking.status === 'in_progress') {
                    setShowArrivedModal(true);
                }
                if (prev && prev.status !== 'completed' && updatedBooking.status === 'completed') {
                    setShowCompletedModal(true);
                }
                return updatedBooking;
            });
        }
    };

    const handleLocationUpdate = (data) => {
        if (data.bookingId === id) {
            setBooking(prev => ({ ...prev, workerLocation: { lat: data.lat, lng: data.lng } }));
        }
    };

    socket.on('bookingStatusUpdated', handleStatusUpdate);
    socket.on('jobAccepted', handleStatusUpdate);
    socket.on('workerLocation', handleLocationUpdate);
    socket.on('workerLocationUpdate', handleLocationUpdate);

    return () => {
        socket.off('bookingStatusUpdated', handleStatusUpdate);
        socket.off('jobAccepted', handleStatusUpdate);
        socket.off('workerLocation', handleLocationUpdate);
        socket.off('workerLocationUpdate', handleLocationUpdate);
    };
  }, [socket, id]);

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
          setBooking(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch booking details", err);
    } finally {
        setLoading(false);
    }
  };

  const handleCompleteJob = async () => {
      try {
          await api.patch(`/bookings/${id}`, { status: 'completed' });
          setBooking(prev => ({ ...prev, status: 'completed' }));
      } catch (err) {
          console.error('Failed to complete job', err);
      }
  };

  const handleCancelBooking = async () => {
      const finalReason = cancelReason === 'Other' ? customReason : cancelReason;
      if (!finalReason) {
          alert('Please provide a reason for cancellation.');
          return;
      }
      setIsCancelling(true);
      try {
          await api.patch(`/bookings/${id}`, { status: 'cancelled', cancelReason: finalReason });
          setBooking(prev => ({ ...prev, status: 'cancelled' }));
          setShowCancelModal(false);
      } catch (err) {
          console.error('Failed to cancel', err);
      } finally {
          setIsCancelling(false);
      }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500 w-8 h-8" /></div>;
  if (!booking) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Booking not found.</div>;

  const center = booking.workerLocation && booking.status === 'in_progress' ? [booking.workerLocation.lat, booking.workerLocation.lng] : (booking.coordinates ? [booking.coordinates.lat, booking.coordinates.lng] : [14.5995, 120.9842]);

  const getStatusIcon = (status) => {
      switch(status) {
          case 'completed': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
          case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
          case 'in_progress': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
          default: return <Clock className="w-5 h-5 text-amber-500" />;
      }
  };

  const getStatusColor = (status) => {
      switch(status) {
          case 'completed': return 'text-emerald-500 bg-emerald-500/10';
          case 'cancelled': return 'text-red-500 bg-red-500/10';
          case 'in_progress': return 'text-blue-500 bg-blue-500/10';
          default: return 'text-amber-500 bg-amber-500/10';
      }
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
        <Dialog open={showArrivedModal} onOpenChange={setShowArrivedModal}>
          <DialogContent className="sm:max-w-md border-emerald-500/20 bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                 <Map className="w-5 h-5 text-emerald-500" />
                 Worker Arrived
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {booking.workerId?.name} has arrived at your location and is starting the job.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
               <Button onClick={() => setShowArrivedModal(false)} className="bg-emerald-600 hover:bg-emerald-700">Acknowledge</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showCompletedModal} onOpenChange={setShowCompletedModal}>
          <DialogContent className="sm:max-w-md border-emerald-500/20 bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                 <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                 Job Completed!
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {booking.workerId?.name} has completed the service. Thank you for using FixConnect!
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
               <Button onClick={() => setShowCompletedModal(false)} className="bg-emerald-600 hover:bg-emerald-700">Okay</Button>
            </div>
          </DialogContent>
        </Dialog>

        <nav className="p-4 sm:p-6 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md z-40 relative">
          <Button variant="ghost" asChild className="pl-0 shrink-0"><Link to="/bookings">&larr; Back</Link></Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 shrink-0 bg-white rounded-full flex items-center justify-center overflow-hidden p-1">
              <img src="/FC-logo.png" alt="FixConnect Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="font-bold text-base sm:text-lg text-white truncate">
                <span className="hidden sm:inline">Status: </span>
                <span className="text-emerald-400">{booking.status.toUpperCase()}</span>
            </span>
          </div>
        </nav>

        <div className="flex-1 relative z-0 flex flex-col md:flex-row overflow-hidden">
            {/* Details Panel */}
            <div className="w-full md:w-[400px] h-1/2 md:h-full bg-card/95 backdrop-blur-md border-r border-border/50 z-50 flex flex-col overflow-y-auto no-scrollbar shadow-2xl p-6 absolute md:relative bottom-0 md:bottom-auto rounded-t-3xl md:rounded-none">
                <div className="flex items-center gap-3 mb-6">
                    {getStatusIcon(booking.status)}
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Booking Details</h2>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                            {booking.status}
                        </span>
                        {eta && booking.status === 'accepted' && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider text-blue-500 bg-blue-500/10">
                                ETA: {eta}
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-background/50 rounded-xl p-4 border border-border/50 space-y-3">
                        <div className="flex items-start gap-3">
                            <Briefcase className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">Service Required</p>
                                <p className="font-medium">{booking.serviceCategory || 'Service'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">Schedule</p>
                                <p className="font-medium">
                                    {booking.date ? new Date(booking.date).toLocaleDateString() : 'ASAP'}, {booking.startTime || 'Now'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">Location</p>
                                <p className="font-medium text-sm line-clamp-2">{booking.address}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-background/50 rounded-xl p-4 border border-border/50 space-y-3">
                        <h3 className="text-sm font-semibold text-emerald-500 mb-2 border-b border-border/50 pb-2">Payment Details</h3>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Base Fee</span>
                            <span className="font-medium">₱{booking.priceAtBooking ? booking.priceAtBooking.toFixed(2) : (booking.totalAmount ? (booking.totalAmount / 1.12).toFixed(2) : '0.00')}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">VAT (12%)</span>
                            <span className="font-medium">₱{booking.priceAtBooking ? (booking.priceAtBooking * 0.12).toFixed(2) : (booking.totalAmount ? (booking.totalAmount - (booking.totalAmount / 1.12)).toFixed(2) : '0.00')}</span>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold text-emerald-500 pt-2 border-t border-border/50">
                            <span>Total</span>
                            <span>₱{booking.totalAmount ? booking.totalAmount.toFixed(2) : (booking.priceAtBooking ? (booking.priceAtBooking * 1.12).toFixed(2) : '0.00')}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50 text-sm">
                            {booking.paymentMethod === 'Cash' ? <Wallet className="w-4 h-4 text-emerald-400" /> : <CreditCard className="w-4 h-4 text-emerald-400" />}
                            <span className="font-medium text-muted-foreground">Method: {booking.paymentMethod || 'Cash'}</span>
                        </div>
                    </div>

                    {booking.workerId && (
                        <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                            <h3 className="text-sm font-semibold text-emerald-500 mb-3">Assigned Worker</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center overflow-hidden shrink-0">
                                    {booking.workerId.userId?.avatar ? (
                                        <img src={booking.workerId.userId.avatar} alt="Worker" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-emerald-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold">{booking.workerId.name || 'Worker Name'}</p>
                                    <p className="text-xs text-muted-foreground">{booking.workerId.userId?.phone || 'Contact Info Unavailable'}</p>
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-gray-300">
                                <p><span className="text-emerald-500 font-medium">Category:</span> {booking.workerId.category}</p>
                                <p><span className="text-emerald-500 font-medium">Rating:</span> {booking.workerId.rating} ★</p>
                                <p className="mt-1 line-clamp-2"><span className="text-emerald-500 font-medium">Overview:</span> {booking.workerId.description}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex flex-col gap-3 shrink-0">
                    {['pending', 'accepted', 'in_progress'].includes(booking.status) && localStorage.getItem('userId') !== booking.workerId?.userId && (
                         <Button variant="destructive" className="w-full font-bold" onClick={() => setShowCancelModal(true)}>
                             Cancel Booking
                         </Button>
                    )}
                    {booking.status === 'in_progress' && localStorage.getItem('userId') === booking.workerId?.userId && (
                        <Button className="w-full font-bold bg-emerald-600 hover:bg-emerald-700" onClick={handleCompleteJob}>
                             Complete Job
                         </Button>
                    )}
                </div>
            </div>

            {/* Map Area */}

            <div className="flex-1 w-full h-full relative z-0 min-h-[50vh]">
                <MapContainer center={center} zoom={13} className="w-full h-full min-h-full" zoomControl={false} style={{ height: '100%' }}>
                    <MapUpdater center={center} />
                    <TileLayer
                        url={import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN ? `https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN}` : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                        attribution={import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN ? '&copy; <a href="https://locationiq.com/?ref=maps">LocationIQ</a> contributors' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
                    />

                {booking.coordinates && (
                    <Marker position={[booking.coordinates.lat, booking.coordinates.lng]} icon={getCustomerIcon(booking.userId, booking.status === 'pending')}>
                        <Popup className="custom-popup"><b>Your Location</b><br/>{booking.address}</Popup>
                    </Marker>
                )}

                {booking.workerLocation && (
                    <Marker position={[booking.workerLocation.lat, booking.workerLocation.lng]} icon={getWorkerIcon()}>
                        <Popup className="custom-popup"><b>Worker Location</b><br/>{booking.workerId?.name || 'Assigned Worker'}</Popup>
                    </Marker>
                )}

                    {booking.workerLocation && booking.coordinates && (
                        <RoutingMachine customerLoc={booking.coordinates} workerLoc={booking.workerLocation} setEta={setEta} />
                    )}
                </MapContainer>
            </div>
        </div>
        {/* No Workers Found Modal */}
        <ResponsiveModal
            open={booking.status === 'rejected'}
            onOpenChange={() => {}}
            title="No Workers Found"
            description="We're sorry, but no workers are currently available for this service in your area. Please try again later."
        >
            <div className="flex flex-col items-center justify-center py-6 text-center">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <p className="text-muted-foreground mb-6">Our active workers might be busy or too far away. Your booking has been automatically cancelled.</p>
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Link to="/bookings">View My Bookings</Link>
                </Button>
            </div>
        </ResponsiveModal>

        {/* Cancel Booking Modal */}
        <ResponsiveModal
            open={showCancelModal}
            onOpenChange={setShowCancelModal}
            title="Cancel Booking"
            description="Please select a reason for cancellation. Note: Cancelling a worker who is already on the way may incur a fee."
        >
            <div className="space-y-4 py-4 pointer-events-auto">
                <div className="space-y-2">
                    {['Worker is taking too long', 'I no longer need the service', 'I found someone else', 'Worker requested cancellation', 'Other'].map(reason => (
                        <label key={reason} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-emerald-500/10 cursor-pointer transition-colors">
                            <input
                                type="radio"
                                name="cancelReason"
                                value={reason}
                                checked={cancelReason === reason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="accent-emerald-500"
                            />
                            <span className="text-sm">{reason}</span>
                        </label>
                    ))}
                </div>
                {cancelReason === 'Other' && (
                    <textarea
                        className="w-full bg-background/50 border border-border/50 rounded-lg p-3 text-sm min-h-[100px] focus:outline-none focus:border-emerald-500"
                        placeholder="Please specify your reason..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                    />
                )}
                <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                    <Button variant="ghost" onClick={() => setShowCancelModal(false)} disabled={isCancelling}>Back</Button>
                    <Button variant="destructive" onClick={handleCancelBooking} disabled={isCancelling}>
                        {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Confirm Cancellation
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
    </div>
  );
}
