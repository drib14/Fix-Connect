import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { Button } from './ui/button';
import { ResponsiveModal } from './ResponsiveModal';
import { CreateBookingForm } from './CreateBookingForm';

// Custom FC Logo Pin for Workers
const workerIcon = new L.Icon({
    iconUrl: '/FC-logo.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'rounded-full border-2 border-emerald-500 bg-white'
});

function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export function CustomerHome() {
  const [workerLocations, setWorkerLocations] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [hasActiveBooking, setHasActiveBooking] = useState(false);

  useEffect(() => {
      fetchWorkerLocations();
      checkActiveBooking();
  }, []);

  const fetchWorkerLocations = async () => {
      try {
          const res = await axios.get('/api/workers/locations');
          if (res.data.success) {
              setWorkerLocations(res.data.data.filter(w => w.currentLocation));
          }
      } catch (err) {
          console.error('Failed to fetch worker locations');
      }
  };

  const checkActiveBooking = async () => {
      try {
          const token = localStorage.getItem('token');
          const userId = localStorage.getItem('userId');
          const res = await axios.get(`/api/bookings/user/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          const active = res.data.some(b => ['pending', 'accepted', 'in_progress'].includes(b.status));
          setHasActiveBooking(active);
      } catch (err) {
          console.error('Failed to check active bookings');
      }
  };

  return (
    <div className="relative w-full h-[calc(100vh-88px)] rounded-xl overflow-hidden shadow-2xl border border-border/50 z-0">
        <MapContainer center={[14.5995, 120.9842]} zoom={13} className="w-full h-full" zoomControl={false}>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {workerLocations.map(worker => (
                <Marker
                    key={worker._id}
                    position={[worker.currentLocation.lat, worker.currentLocation.lng]}
                    icon={workerIcon}
                >
                    <Popup className="custom-popup">
                        <div className="font-bold text-emerald-600">{worker.name}</div>
                        <div className="text-xs text-gray-600">{worker.category}</div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
            {hasActiveBooking ? (
                <div className="bg-card/90 backdrop-blur px-6 py-3 rounded-full border border-emerald-500/50 shadow-lg text-emerald-400 font-medium">
                    You have an active booking. Check "My Bookings" page.
                </div>
            ) : (
                <ResponsiveModal
                    title="Request a Service"
                    description="Fill out the details below to find a skilled worker near you."
                    open={isBookingModalOpen}
                    onOpenChange={setIsBookingModalOpen}
                    trigger={
                        <Button size="lg" className="font-bold text-lg px-8 shadow-xl shadow-emerald-500/25 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">
                            Request a FixConnect Worker
                        </Button>
                    }
                >
                    <CreateBookingForm
                        onSuccess={(newBooking) => {
                            setIsBookingModalOpen(false);
                            setHasActiveBooking(true);
                            window.location.href = `/booking/${newBooking._id}`;
                        }}
                        onCancel={() => setIsBookingModalOpen(false)}
                    />
                </ResponsiveModal>
            )}
        </div>
    </div>
  );
}
