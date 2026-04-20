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

// Custom Mascot Pin for Workers
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

function getCustomerIcon() {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    let initials = 'USER';
    if (user && user.firstName && user.lastName) {
        initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user && user.firstName) {
        initials = user.firstName.charAt(0).toUpperCase();
    }

    const avatarUrl = localStorage.getItem('userAvatar') || user?.avatar || `https://ui-avatars.com/api/?name=${initials}&background=10b981&color=fff`;

    // Instead of using just the image as the map pin, we use a custom divIcon that looks like a map pin pointing down,
    // with the user's avatar inside it.
    return new L.DivIcon({
        html: `
            <div style="position: relative; width: 40px; height: 50px; display: flex; flex-direction: column; align-items: center;">
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

function MapUpdater({ center }) {
    const map = useMap();
    const prevCenter = React.useRef(null);
    useEffect(() => {
        if (center && (!prevCenter.current || prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1])) {
            map.flyTo(center, 15, {
                animate: true,
                duration: 1.5
            });
            prevCenter.current = center;
        }
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
  const [activeBookingDetails, setActiveBookingDetails] = useState(null);

  useEffect(() => {
      fetchWorkerLocations();
      checkActiveBooking();

      // Auto-locate on load
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const newLoc = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                      address: 'Current Location'
                  };
                  setCustomerLocation(newLoc);
              },
              (err) => console.error(err),
              { enableHighAccuracy: true }
          );
      }
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
                  setActiveBookingDetails(active);
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
                    icon={getWorkerIcon()}
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
                <h2 className="text-xl font-bold mb-2">What service do you need?</h2>
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
                                setActiveBookingDetails(newBooking);
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
            bookingDetails={activeBookingDetails}
        />
    </div>
  );
}
