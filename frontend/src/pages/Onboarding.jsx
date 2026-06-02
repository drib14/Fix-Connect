import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../store/authSlice.js';
import { MapPin, Briefcase, Calendar, Navigation, ArrowRight, ShieldCheck, Star } from 'lucide-react';

export const Onboarding = () => {
  const { user, accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Customer Onboarding States
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCoords, setSelectedCoords] = useState({ lat: 0, lng: 0 });

  // Provider Onboarding States
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [transportType, setTransportType] = useState('motorcycle');
  const [baseRate, setBaseRate] = useState('20');
  const [serviceRadius, setServiceRadius] = useState('15');
  const [availableDays, setAvailableDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');

  useEffect(() => {
    // If not logged in, kick out to login
    if (!accessToken) {
      navigate('/login');
    }
    // If already onboarded, kick out to home
    if (user?.isOnboarded) {
      navigate('/');
    }
  }, [user, accessToken, navigate]);

  // Geocode address suggestions via LocationIQ
  const handleAddressChange = async (e) => {
    const query = e.target.value;
    setAddress(query);

    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const token = import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN || 'pk.e31e6705bd87772aa6b6ab21a599c867';
      const url = `https://us1.locationiq.com/v1/search?key=${token}&q=${encodeURIComponent(query)}&format=json&limit=5`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error('LocationIQ suggestions fetch failed.', err);
    }
  };

  const handleSelectSuggestion = (item) => {
    setAddress(item.display_name);
    setSelectedCoords({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    });
    setSuggestions([]);
  };

  const toggleDay = (day) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  // Submit Customer Onboarding
  const handleCustomerSubmit = async () => {
    if (!address) {
      setError('Please provide your service location address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/onboard/customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          address,
          lat: selectedCoords.lat,
          lng: selectedCoords.lng,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Sync Redux Store credentials
        dispatch(setCredentials({
          accessToken,
          user: data.data.user,
        }));
        navigate('/');
      } else {
        setError(data.message || 'Onboarding failed.');
      }
    } catch (err) {
      setError('Network error during onboarding submission.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Provider Onboarding
  const handleProviderSubmit = async () => {
    if (!businessName || !bio) {
      setError('Business Name and Professional Bio are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/onboard/provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          businessName,
          transportType,
          baseRate: Number(baseRate),
          bio,
          serviceRadius: Number(serviceRadius),
          availability: {
            days: availableDays,
            startTime,
            endTime,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        dispatch(setCredentials({
          accessToken,
          user: data.data.user,
        }));
        navigate('/');
      } else {
        setError(data.message || 'Onboarding failed.');
      }
    } catch (err) {
      setError('Network error during onboarding submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' }}>
      <div className="auth-card animate-slide" style={{ maxWidth: '600px' }}>
        
        {/* Onboarding Heading */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <ShieldCheck size={42} style={{ color: 'var(--primary)', marginBottom: '0.8rem' }} />
          <h2 className="auth-title">Complete Onboarding</h2>
          <p className="auth-subtitle" style={{ marginBottom: '0' }}>Configure your SaaS profile setup to activate account dashboard.</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* -------------------- CUSTOMER JOURNEY -------------------- */}
        {user?.role === 'customer' && (
          <div>
            {step === 1 && (
              <div className="animate-fade">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Step 1: Contact Verification</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.8rem' }}>
                  Please confirm your profile registration details before adding location maps.
                </p>

                <div className="form-group">
                  <span className="form-label">Registered Name</span>
                  <input type="text" className="form-input" value={user.name} disabled />
                </div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <span className="form-label">Email Address</span>
                  <input type="text" className="form-input" value={user.email} disabled />
                </div>

                <button className="btn btn-primary w-full" style={{ width: '100%' }} onClick={() => setStep(2)}>
                  Next Step: Set Location <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={20} style={{ color: 'var(--primary)' }} /> Step 2: Primary Care Location
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.8rem' }}>
                  We query the LocationIQ mapping API to resolve exact distance indices for matching nearby care contractors.
                </p>

                <div className="form-group" style={{ position: 'relative', marginBottom: '2rem' }}>
                  <label className="form-label" htmlFor="address-input">Service Address</label>
                  <input
                    type="text"
                    id="address-input"
                    className="form-input"
                    placeholder="Enter your street address or city..."
                    value={address}
                    onChange={handleAddressChange}
                    required
                  />

                  {/* Suggestion Dropdown */}
                  {suggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid var(--surface-border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 10,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      marginTop: '4px',
                    }}>
                      {suggestions.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectSuggestion(item)}
                          style={{
                            padding: '0.8rem 1.2rem',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid var(--background)',
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {item.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                    onClick={handleCustomerSubmit}
                    disabled={loading}
                  >
                    {loading ? <div className="spinner"></div> : <>Activate Dashboard <ArrowRight size={18} /></>}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------- PROVIDER JOURNEY -------------------- */}
        {user?.role === 'provider' && (
          <div>
            {step === 1 && (
              <div className="animate-fade">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Briefcase size={20} style={{ color: 'var(--primary)' }} /> Step 1: Business Profile Details
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.8rem' }}>
                  Set up your business presence and compose your specialized public bio.
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="biz-name">Registered Business Name</label>
                  <input
                    type="text"
                    id="biz-name"
                    className="form-input"
                    placeholder="e.g. Sterling Plumbers, Oswald Cleaning Co."
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label" htmlFor="biz-bio">Professional Bio</label>
                  <textarea
                    id="biz-bio"
                    className="form-input"
                    style={{ height: '110px', resize: 'none' }}
                    placeholder="Tell prospective customers about your experience, certifications, and service standards..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                  />
                </div>

                <button className="btn btn-primary w-full" style={{ width: '100%' }} onClick={() => {
                  if(!businessName || !bio) {
                    setError('Business Name and Professional Bio are required.');
                  } else {
                    setError('');
                    setStep(2);
                  }
                }}>
                  Next Step: Services & Rates <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Star size={20} style={{ color: 'var(--primary)' }} /> Step 2: Transport & Rates
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.8rem' }}>
                  Define your mode of transport and your minimum base rate.
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="transportType">Transport Type</label>
                  <select
                    id="transportType"
                    className="form-input"
                    value={transportType}
                    onChange={(e) => setTransportType(e.target.value)}
                  >
                    <option value="motorcycle">Motorcycle</option>
                    <option value="car">Car</option>
                    <option value="van">Van</option>
                    <option value="truck">Truck</option>
                    <option value="walking">Walking</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label" htmlFor="rate">Base Rate ($ USD)</label>
                  <input
                    type="number"
                    id="rate"
                    className="form-input"
                    placeholder="20"
                    min="0"
                    max="300"
                    value={baseRate}
                    onChange={(e) => setBaseRate(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(3)}>
                    Next Step: Availability & Hours <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={20} style={{ color: 'var(--primary)' }} /> Step 3: Availability Schedule
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Choose the days of the week and standard hours that customers are allowed to book.
                </p>

                <div className="form-group">
                  <span className="form-label">Available Days</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '1.2rem' }}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div
                        key={day}
                        onClick={() => toggleDay(day)}
                        style={{
                          padding: '0.5rem',
                          textAlign: 'center',
                          border: '1px solid var(--surface-border)',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          backgroundColor: availableDays.includes(day) ? 'var(--primary-soft)' : 'white',
                          color: availableDays.includes(day) ? 'var(--primary)' : 'var(--text-secondary)',
                          borderColor: availableDays.includes(day) ? 'var(--primary)' : 'var(--surface-border)',
                          transition: 'var(--transition)',
                        }}
                      >
                        {day.substring(0, 3)}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="start-time">Shift Start Time</label>
                    <input type="time" id="start-time" className="form-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="end-time">Shift End Time</label>
                    <input type="time" id="end-time" className="form-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(4)}>
                    Next Step: Service Radius <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-fade">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Navigation size={20} style={{ color: 'var(--primary)' }} /> Step 4: Service Dispatch Radius
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.8rem' }}>
                  Define the maximum dispatch travel distance from your central business base in kilometers.
                </p>

                <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="form-label">Dispatch Travel Range</span>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>{serviceRadius} km</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                    value={serviceRadius}
                    onChange={(e) => setServiceRadius(e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>5 km</span>
                    <span>50 km</span>
                    <span>100 km</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-outline" onClick={() => setStep(3)}>Back</button>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1 }} 
                    onClick={handleProviderSubmit}
                    disabled={loading}
                  >
                    {loading ? <div className="spinner"></div> : <>Finalize SaaS Profile <ArrowRight size={18} /></>}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
