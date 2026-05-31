import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix Leaflet default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom emerald pin icon factory
const createCustomIcon = (color = '#10b981') => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        width: 28px; height: 28px;
        background: ${color};
        border: 3px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
      ">
        <div style="
          width: 8px; height: 8px;
          background: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

const MapPreview = ({
  clientCoords = { lat: 14.5995, lng: 121.0494 },
  workerCoords = null,
  zoom = 13,
  height = '240px',
  showRoute = true,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  // Check if coords are valid (not 0,0)
  const isValidCoords = (coords) => {
    return coords && (coords.lat !== 0 || coords.lng !== 0);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: true,
        doubleClickZoom: false,
      }).setView([clientCoords.lat, clientCoords.lng], zoom);

      // Dark-themed tile layer matching emerald brand
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Add small zoom control at bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers and polyline
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // Add client marker
    if (isValidCoords(clientCoords)) {
      const clientMarker = L.marker([clientCoords.lat, clientCoords.lng], {
        icon: createCustomIcon('#10b981'),
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: 'Outfit', sans-serif; padding: 4px 0; text-align: center;">
            <strong style="color: #10b981; font-size: 13px;">📍 Your Location</strong>
          </div>`
        );
      markersRef.current.push(clientMarker);
    }

    // Add worker marker
    if (workerCoords && isValidCoords(workerCoords)) {
      const workerMarker = L.marker([workerCoords.lat, workerCoords.lng], {
        icon: createCustomIcon('#047857'),
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: 'Outfit', sans-serif; padding: 4px 0; text-align: center;">
            <strong style="color: #047857; font-size: 13px;">🔧 Technician</strong>
          </div>`
        );
      markersRef.current.push(workerMarker);

      // Draw route polyline between client and worker
      if (showRoute) {
        polylineRef.current = L.polyline(
          [
            [clientCoords.lat, clientCoords.lng],
            [workerCoords.lat, workerCoords.lng],
          ],
          {
            color: '#10b981',
            weight: 3,
            opacity: 0.8,
            dashArray: '10 6',
            lineCap: 'round',
          }
        ).addTo(map);
      }

      // Fit bounds to show both markers
      const bounds = L.latLngBounds(
        [clientCoords.lat, clientCoords.lng],
        [workerCoords.lat, workerCoords.lng]
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (isValidCoords(clientCoords)) {
      map.setView([clientCoords.lat, clientCoords.lng], zoom);
    }

    // Force map resize after render
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      // Cleanup on unmount
    };
  }, [clientCoords.lat, clientCoords.lng, workerCoords?.lat, workerCoords?.lng]);

  // Cleanup map on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // If no valid coordinates, show fallback SVG
  if (!isValidCoords(clientCoords)) {
    return (
      <div
        style={{
          height,
          background: '#0f172a',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: '#64748b',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        }}
      >
        <MapPin size={24} color="#10b981" />
        <span style={{ fontSize: '12px', fontWeight: '600' }}>
          Location coordinates not available
        </span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
      <div
        ref={mapRef}
        style={{
          height,
          width: '100%',
          borderRadius: '16px',
          zIndex: 1,
        }}
      />
      {/* Overlay label */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(4px)',
          padding: '5px 12px',
          borderRadius: '20px',
          color: '#10b981',
          fontSize: '10px',
          fontWeight: 'bold',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#10b981',
            animation: 'radarPing 1.5s infinite',
          }}
        />
        Live GPS Tracking
      </div>
    </div>
  );
};

export default MapPreview;
