import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../utils/api';
import { ArrowLeft, MapPin, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';

// Fix leaflet default markers paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Zod Schema
const bookingSchema = z.object({
  address: z.string().min(5, 'Please enter a valid, complete address.'),
  description: z.string().min(10, 'Please write a clear description of the problem (at least 10 characters).').max(1000),
});

export default function BookService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coords, setCoords] = useState([14.5995, 120.9842]); // Default Manila
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      address: '123 Taft Ave, Manila, Metro Manila',
      description: '',
    }
  });

  const addressVal = watch('address');

  // Fetch service details
  const { data: service, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const res = await api.get(`/services/${id}`);
      return res.data.service;
    }
  });

  // Autocomplete LocationIQ suggestions
  useEffect(() => {
    if (!addressVal || addressVal.trim().length < 4) {
      setAddressSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const response = await api.get(`/location/search?q=${encodeURIComponent(addressVal)}`);
        setAddressSuggestions(response.data.results || []);
      } catch (err) {
        console.warn('Geocoding search failed');
      } finally {
        setLoadingSuggestions(false);
      }
    }, 800);

    return () => clearTimeout(delayDebounce);
  }, [addressVal]);

  const selectSuggestion = (sug) => {
    setValue('address', sug.display_name);
    setCoords([parseFloat(sug.lat), parseFloat(sug.lon)]);
    setAddressSuggestions([]);
    setShowSuggestions(false);
  };

  // Reverse Geocoding helper on map click
  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      const response = await api.get(`/location/reverse?lat=${lat}&lon=${lng}`);
      if (response.data && response.data.display_name) {
        setValue('address', response.data.display_name);
      }
    } catch (err) {
      console.warn('Reverse geocoding failed');
    }
  };

  // Map Click events handler helper component
  function MapEvents() {
    useMapEvents({
      click(e) {
        setCoords([e.latlng.lat, e.latlng.lng]);
        fetchAddressFromCoords(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  // Map View update helper component
  function MapController({ coords }) {
    const map = useMap();
    useEffect(() => {
      map.setView(coords, map.getZoom());
    }, [coords, map]);
    return null;
  }

  // Mutation to place booking draft + request
  const bookingMutation = useMutation({
    mutationFn: async (data) => {
      // 1. Create Draft
      const draftRes = await api.post('/bookings/draft', {
        service_id: id,
        latitude: coords[0],
        longitude: coords[1],
        formatted_address: data.address,
        problem_description: data.description,
      });

      const draftId = draftRes.data.booking._id;

      // 2. Request Provider Dispatch
      const requestRes = await api.post(`/bookings/${draftId}/request`);
      return requestRes.data.booking;
    },
    onSuccess: (booking) => {
      toast.success('Service booked! Searching for nearby technicians...');
      navigate(`/bookings/${booking._id}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Booking submission failed. Please try again.');
    }
  });

  const onSubmit = (data) => {
    bookingMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ height: '300px' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading form...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to={`/categories`} className="btn btn-light rounded-circle p-2 border hover-bg-light">
          <ArrowLeft size={18} className="text-secondary" />
        </Link>
        <div>
          <h4 className="fw-bold mb-0 text-dark">Book Service</h4>
          <span className="text-secondary small">{service?.title}</span>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Form Column */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Address Input */}
              <div className="mb-3 position-relative">
                <label className="form-label small fw-bold text-dark d-flex align-items-center gap-1">
                  <MapPin size={16} className="text-success" /> Service Address Location
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                  placeholder="Street Address, City"
                  {...register('address')}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {errors.address && (
                  <div className="invalid-feedback">{errors.address.message}</div>
                )}

                {/* Suggestions Dropdown */}
                {showSuggestions && addressSuggestions.length > 0 && (
                  <ul className="list-group position-absolute w-100 shadow-lg mt-1 z-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {addressSuggestions.map((sug, i) => (
                      <li
                        key={i}
                        className="list-group-item list-group-item-action small text-truncate cursor-pointer"
                        onMouseDown={() => selectSuggestion(sug)}
                        style={{ cursor: 'pointer' }}
                      >
                        {sug.display_name}
                      </li>
                    ))}
                  </ul>
                )}
                {loadingSuggestions && (
                  <div className="spinner-border spinner-border-sm text-success position-absolute end-0 top-50 translate-middle-y me-3" role="status" style={{ marginTop: '4px' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                )}
              </div>

              {/* Problem Description */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark">Problem Description</label>
                <textarea
                  rows={5}
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  placeholder="Detail the issue (e.g. Toilet is leaking at the base and running constantly since this morning)"
                  {...register('description')}
                />
                {errors.description && (
                  <div className="invalid-feedback">{errors.description.message}</div>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-success btn-lg w-100 py-3 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={bookingMutation.isPending}
              >
                {bookingMutation.isPending ? (
                  <>
                    <div className="spinner-border spinner-border-sm" role="status" />
                    <span>Booking Dispatch...</span>
                  </>
                ) : (
                  <span>Request Dispatch</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Map Preview Column */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4 h-100 d-flex flex-column" style={{ borderRadius: '16px', minHeight: '350px' }}>
            <h6 className="fw-bold mb-2 text-dark">Pin Your Location</h6>
            <p className="text-secondary small mb-3">You can click anywhere on the map to drag and adjust your pinpoint address automatically.</p>
            
            <div className="flex-grow-1 border rounded overflow-hidden position-relative mb-2" style={{ minHeight: '260px' }}>
              <MapContainer 
                center={coords} 
                zoom={14} 
                scrollWheelZoom={true} 
                style={{ width: '100%', height: '100%', position: 'absolute' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={coords} />
                <MapEvents />
                <MapController coords={coords} />
              </MapContainer>
            </div>
            
            <div className="d-flex align-items-center gap-2 mt-2 p-2 bg-light rounded small text-secondary">
              <AlertCircle size={16} className="text-success" />
              <span>Map centered near Manila</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
