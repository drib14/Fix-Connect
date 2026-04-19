import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { Button } from '../components/ui/button';
import { useSocket } from '../contexts/SocketContext';
import { Loader2, Briefcase, Calendar, MapPin, Wallet, CreditCard, User, CheckCircle2, XCircle, Clock } from 'lucide-react';

const workerIcon = new L.Icon({
    iconUrl: '/FC-logo.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'rounded-full border-2 border-emerald-500 bg-white'
});

function getCustomerIcon(user) {
    const name = user?.firstName ? `${user.firstName}+${user.lastName || ''}` : 'User';
    const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${name}&background=10b981&color=fff`;

    return new L.Icon({
        iconUrl: avatarUrl,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
        className: 'rounded-full border-2 border-primary bg-white object-cover'
    });
}

function RoutingMachine({ customerLoc, workerLoc }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !customerLoc || !workerLoc) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(workerLoc.lat, workerLoc.lng),
                L.latLng(customerLoc.lat, customerLoc.lng)
            ],
            lineOptions: {
                styles: [{ color: '#10b981', weight: 4 }]
            },
            show: false,
            addWaypoints: false,
            routeWhileDragging: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
            createMarker: () => null // We draw our own markers
        }).addTo(map);

        return () => map.removeControl(routingControl);
    }, [map, customerLoc, workerLoc]);

    return null;
}

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    fetchBooking();
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
        if (updatedBooking._id === id) setBooking(updatedBooking);
    };

    const handleLocationUpdate = (data) => {
        if (data.bookingId === id) {
            setBooking(prev => ({ ...prev, workerLocation: { lat: data.lat, lng: data.lng } }));
        }
    };

    socket.on('bookingStatusUpdated', handleStatusUpdate);
    socket.on('jobAccepted', handleStatusUpdate);
    socket.on('workerLocation', handleLocationUpdate);

    return () => {
        socket.off('bookingStatusUpdated', handleStatusUpdate);
        socket.off('jobAccepted', handleStatusUpdate);
        socket.off('workerLocation', handleLocationUpdate);
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

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500 w-8 h-8" /></div>;
  if (!booking) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Booking not found.</div>;

  const center = booking.coordinates ? [booking.coordinates.lat, booking.coordinates.lng] : [14.5995, 120.9842];

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
    <div className="min-h-screen bg-background flex flex-col">
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

        <div className="flex-1 relative z-0 flex flex-col md:flex-row">
            {/* Details Panel */}
            <div className="w-full md:w-[400px] h-1/2 md:h-full bg-card/95 backdrop-blur-md border-r border-border/50 z-10 flex flex-col overflow-y-auto shadow-2xl p-6 absolute md:relative bottom-0 md:bottom-auto rounded-t-3xl md:rounded-none">
                <div className="flex items-center gap-3 mb-6">
                    {getStatusIcon(booking.status)}
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Booking Details</h2>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                            {booking.status}
                        </span>
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
                        </div>
                    )}
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 w-full h-1/2 md:h-full relative z-0">
                <MapContainer center={center} zoom={13} className="w-full h-full" zoomControl={false}>
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />

                {booking.coordinates && (
                    <Marker position={[booking.coordinates.lat, booking.coordinates.lng]} icon={getCustomerIcon(booking.userId)}>
                        <Popup className="custom-popup"><b>Your Location</b><br/>{booking.address}</Popup>
                    </Marker>
                )}

                {booking.workerLocation && (
                    <Marker position={[booking.workerLocation.lat, booking.workerLocation.lng]} icon={workerIcon}>
                        <Popup className="custom-popup"><b>Worker Location</b><br/>{booking.workerId?.name || 'Assigned Worker'}</Popup>
                    </Marker>
                )}

                    {booking.workerLocation && booking.coordinates && (
                        <RoutingMachine customerLoc={booking.coordinates} workerLoc={booking.workerLocation} />
                    )}
                </MapContainer>
            </div>
        </div>
    </div>
  );
}
