import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { Button } from '../components/ui/button';
import { useSocket } from '../contexts/SocketContext';
import { Loader2 } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
        <nav className="p-6 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md z-40">
          <Button variant="ghost" asChild><Link to="/bookings">&larr; Back to Bookings</Link></Button>
          <span className="font-bold text-lg text-white">Booking Status: <span className="text-emerald-400">{booking.status.toUpperCase()}</span></span>
        </nav>

        <div className="flex-1 relative z-0">
            <MapContainer center={center} zoom={13} className="w-full h-full" zoomControl={false}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
  );
}
