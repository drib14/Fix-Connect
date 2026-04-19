import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { Button } from './ui/button';
import { ResponsiveModal } from './ResponsiveModal';
import { CreateBookingForm } from './CreateBookingForm';
import { Target } from 'lucide-react';
import { SearchingWorkerModal } from './SearchingWorkerModal';
import { Link } from 'react-router-dom';

// Custom FC Logo Pin for Workers
const workerIcon = new L.Icon({
    iconUrl: '/FC-logo.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'rounded-full border-2 border-emerald-500 bg-white'
});

function getCustomerIcon() {
    const avatarUrl = localStorage.getItem('userAvatar') || `https://ui-avatars.com/api/?name=Me&background=10b981&color=fff`;
    return new L.Icon({
        iconUrl: avatarUrl,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
        className: 'rounded-full border-2 border-primary bg-white object-cover'
    });
}

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
  const [mapCenter, setMapCenter] = useState([14.5995, 120.9842]);
  const [customerLocation, setCustomerLocation] = useState({ address: '', lat: null, lng: null });

  // Searching flow states
  const [isSearching, setIsSearching] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState(null);

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
          const active = res.data.find(b => ['pending', 'accepted', 'in_progress'].includes(b.status));
          if (active) {
              setHasActiveBooking(true);
              if (active.status === 'pending') {
                  setActiveBookingId(active._id);
                  setIsSearching(true);
              }
          }
      } catch (err) {
          console.error('Failed to check active bookings');
      }
  };

  const handleLocateMe = () => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const newLoc = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                      address: 'Current Location'
                  };
                  setMapCenter([newLoc.lat, newLoc.lng]);
                  setCustomerLocation(newLoc);
              },
              () => alert('Unable to retrieve your location.')
          );
      } else {
          alert('Geolocation is not supported by your browser.');
      }
  };

  // Center map dynamically when customerLocation updates from dropdown
  useEffect(() => {
      if (customerLocation.lat && customerLocation.lng) {
          setMapCenter([customerLocation.lat, customerLocation.lng]);
      }
  }, [customerLocation]);

  return (
    <div className="relative w-full h-full overflow-hidden z-0">
        <MapContainer center={mapCenter} zoom={13} className="w-full h-full" zoomControl={false}>
            <MapUpdater center={mapCenter} />
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {customerLocation.lat && customerLocation.lng && (
                <Marker position={[customerLocation.lat, customerLocation.lng]} icon={getCustomerIcon()}>
                    <Popup>Your Location</Popup>
                </Marker>
            )}

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

        {/* Floating Actions */}
        <div className="absolute bottom-40 right-4 md:bottom-8 md:right-8 z-[1000] flex flex-col items-end gap-4">
            <button
                onClick={handleLocateMe}
                className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-primary hover:bg-gray-100 transition-colors ring-2 ring-border/50"
                title="Locate Me"
            >
                <Target size={24} />
            </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full md:bottom-8 md:left-8 md:w-auto z-[1000]">
            <div className="bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl md:rounded-2xl p-6 md:w-96 rounded-t-2xl">
                <h2 className="text-xl font-bold mb-2">Where to?</h2>
                <p className="text-sm text-muted-foreground mb-4">Find a skilled worker for your repairs.</p>

                {hasActiveBooking && !isSearching ? (
                    <Button asChild className="w-full font-bold shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Link to="/bookings">View Active Booking</Link>
                    </Button>
                ) : (
                    <ResponsiveModal
                        title="Request a Service"
                        description="Fill out the details to find a skilled worker."
                        open={isBookingModalOpen}
                        onOpenChange={setIsBookingModalOpen}
                        trigger={
                            <Button size="lg" className="w-full font-bold text-lg shadow-xl shadow-emerald-500/25 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center gap-2">
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center p-0.5">
                                    <img src="/FC-logo.png" alt="FC" className="w-full h-full rounded-full object-cover" />
                                </div>
                                Book a service
                            </Button>
                        }
                    >
                        <CreateBookingForm
                            customerLocation={customerLocation}
                            setCustomerLocation={setCustomerLocation}
                            onSuccess={(newBooking) => {
                                setIsBookingModalOpen(false);
                                setHasActiveBooking(true);
                                setActiveBookingId(newBooking._id);
                                setIsSearching(true);
                            }}
                            onCancel={() => setIsBookingModalOpen(false)}
                        />
                    </ResponsiveModal>
                )}
            </div>
        </div>

        {/* Searching Worker Interactive Modal */}
        <SearchingWorkerModal
            isOpen={isSearching}
            setIsOpen={setIsSearching}
            bookingId={activeBookingId}
        />
    </div>
  );
}
