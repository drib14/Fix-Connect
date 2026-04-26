import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSocket } from '../contexts/SocketContext';
import { Target, MapPin, Navigation, Compass } from 'lucide-react';
import { Button } from './ui/button';

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const getWorkerIcon = () => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div class="relative w-12 h-12 flex items-center justify-center">
                <div class="absolute w-full h-full bg-emerald-500/20 rounded-full animate-ping"></div>
                <div class="relative w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50 overflow-hidden border-2 border-emerald-500">
                    <img src="/FC-logo.png" alt="Pro" class="w-full h-full object-cover" />
                </div>
                <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
    });
};

export function WorkerHome() {
    const [mapCenter, setMapCenter] = useState([14.5995, 120.9842]);
    const [workerSettings, setWorkerSettings] = useState({ isOnline: true, travelRadius: 15 });
    const [availableJobs, setAvailableJobs] = useState([]);
    const [activeJob, setActiveJob] = useState(null);
    const socket = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        handleLocateMe();
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('newAvailableJob', (job) => setAvailableJobs(prev => [job, ...prev]));
        socket.on('jobRemoved', (jobId) => setAvailableJobs(prev => prev.filter(job => job._id !== jobId)));
        return () => {
            socket.off('newAvailableJob');
            socket.off('jobRemoved');
        };
    }, [socket]);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [settingsRes, jobsRes, activeRes] = await Promise.all([
                axios.get('/api/workers/me', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/bookings/available', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`/api/bookings/user/${localStorage.getItem('userId')}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (settingsRes.data) {
                setWorkerSettings({ isOnline: settingsRes.data.isOnline ?? true, travelRadius: settingsRes.data.travelRadius ?? 15 });
            }
            if (jobsRes.data) {
                setAvailableJobs(jobsRes.data);
            }
            if (activeRes.data) {
                const ongoing = activeRes.data.find(b => b.status === 'accepted' || b.status === 'in_progress');
                if (ongoing) setActiveJob(ongoing);
            }
        } catch (err) {
            console.error("Failed to load worker home data", err);
        }
    };

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setMapCenter([position.coords.latitude, position.coords.longitude]);
                    // Update location on backend
                    const token = localStorage.getItem('token');
                    axios.put('/api/workers/settings', {
                        currentLocation: { lat: position.coords.latitude, lng: position.coords.longitude }
                    }, { headers: { Authorization: `Bearer ${token}` } });
                },
                () => alert('Unable to retrieve your location.')
            );
        }
    };

    const toggleStatus = async () => {
        const newState = !workerSettings.isOnline;
        setWorkerSettings(prev => ({ ...prev, isOnline: newState }));
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/workers/settings', { isOnline: newState }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) {
            console.error("Failed to update status");
        }
    };

    return (
        <div className="relative w-full h-full overflow-hidden z-0">
            <MapContainer center={mapCenter} zoom={14} className="w-full h-full" zoomControl={false}>
                <MapUpdater center={mapCenter} />
                <TileLayer
                    url={import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN ? `https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN}` : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                    attribution='&copy; LocationIQ'
                />

                <Marker position={mapCenter} icon={getWorkerIcon()}>
                    <Popup>Your Current Location</Popup>
                </Marker>

                {/* Show incoming jobs on map */}
                {workerSettings.isOnline && availableJobs.map(job => (
                    job.coordinates && (
                        <Marker
                            key={job._id}
                            position={[job.coordinates.lat, job.coordinates.lng]}
                        >
                            <Popup className="custom-popup">
                                <div className="font-bold text-red-500">NEW REQUEST</div>
                                <div className="text-xs text-gray-600">{job.serviceCategory}</div>
                                <div className="font-bold text-emerald-600 mt-1">Est: ₱{(job.price * 0.8).toFixed(2)}</div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>

            {/* Top Status Bar overlay */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000]">
                <button
                    onClick={toggleStatus}
                    className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg backdrop-blur-md border border-border/50 transition-all ${workerSettings.isOnline ? 'bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20' : 'bg-background/80 text-muted-foreground'}`}
                >
                    <div className="relative flex h-3 w-3">
                      {workerSettings.isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${workerSettings.isOnline ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                    </div>
                    <span className="font-bold text-sm tracking-widest uppercase">
                        {workerSettings.isOnline ? 'Online & Scanning' : 'Offline'}
                    </span>
                </button>
            </div>

            {/* Floating Actions */}
            <div className="absolute bottom-40 right-4 md:bottom-8 md:right-8 z-[1000] flex flex-col gap-4">
                <button
                    onClick={handleLocateMe}
                    className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-primary hover:bg-gray-100 transition-colors ring-2 ring-border/50"
                    title="Center Map"
                >
                    <Navigation size={22} className="ml-[-2px] mt-[2px]" />
                </button>
            </div>

            {/* Bottom Dashboard Panel */}
            <div className="absolute bottom-0 left-0 w-full md:bottom-8 md:left-8 md:w-auto z-[1000]">
                <div className="bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl md:rounded-2xl p-6 md:w-96 rounded-t-2xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Compass className="w-5 h-5 text-emerald-500" /> Professional Terminal
                    </h2>

                    {activeJob ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Active Job</span>
                                <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-md">{activeJob.status}</span>
                            </div>
                            <p className="font-medium text-white mb-1">{activeJob.serviceCategory}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1 mb-4">{activeJob.address}</p>
                            <Button onClick={() => navigate(`/booking/${activeJob._id}`)} className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold">
                                View Navigation Details
                            </Button>
                        </div>
                    ) : workerSettings.isOnline ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-background/50 p-3 rounded-lg border border-border/50">
                                <span className="text-sm text-muted-foreground">Nearby Requests</span>
                                <span className="font-bold text-emerald-400 text-lg">{availableJobs.length}</span>
                            </div>
                            <Button onClick={() => navigate('/bookings')} className="w-full font-bold shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700">
                                Open Pro Dashboard
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center py-4 bg-background/50 rounded-xl border border-border/50">
                            <p className="text-muted-foreground text-sm mb-3">You are currently offline.</p>
                            <Button onClick={toggleStatus} variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                                Go Online Now
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
