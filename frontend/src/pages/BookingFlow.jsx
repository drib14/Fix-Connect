import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Wrench, Zap, Brush, Sparkles,
  Calendar, Clock, MapPin, Check, AlertCircle, Search, Star, Navigation
} from 'lucide-react';
import { createBooking, clearCreateSuccess, fetchAvailableSlots } from '../store/bookingSlice.js';
import { formatPrice } from '../store/currencySlice.js';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';

const STEPS = ['Service', 'Provider', 'Schedule', 'Confirm'];

const getIcon = (name) => {
  const icons = { Wrench: <Wrench size={22} />, Zap: <Zap size={22} />, Brush: <Brush size={22} />, Sparkles: <Sparkles size={22} /> };
  return icons[name] || <Wrench size={22} />;
};

// Generate next 14 days for date picker
const generateDates = () => Array.from({ length: 14 }, (_, i) => {
  const d = addDays(new Date(), i + 1);
  return { date: d, label: format(d, 'EEE'), day: format(d, 'd'), month: format(d, 'MMM'), iso: format(d, 'yyyy-MM-dd') };
});

const BookingFlow = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accessToken } = useSelector(state => state.auth);
  const { loading, createSuccess, activeBooking, error: bookingError, slots, slotsLoading } = useSelector(state => state.bookings);
  const { selected, rates, currencies } = useSelector(state => state.currency);

  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Booking form state
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [duration, setDuration] = useState(1);

  const dates = generateDates();

  // Fetch categories and workers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, workRes] = await Promise.all([
          fetch('/api/categories').then(r => r.json()),
          fetch('/api/workers').then(r => r.json()),
        ]);
        setCategories(catRes.data?.categories || []);
        setWorkers(workRes.data?.workers || []);
      } catch { toast.error('Failed to load services'); }
      finally { setDataLoading(false); }
    };
    fetchData();
  }, []);

  // Fetch slots when date or provider changes
  useEffect(() => {
    if (selectedProvider && selectedDate && step === 2) {
      dispatch(fetchAvailableSlots({ providerId: selectedProvider.id || selectedProvider._id, date: selectedDate.iso }));
    }
  }, [selectedProvider, selectedDate, step, dispatch]);

  // Redirect on booking success
  useEffect(() => {
    if (createSuccess && activeBooking) {
      toast.success(`Booking #${activeBooking.referenceNumber} created!`);
      dispatch(clearCreateSuccess());
      navigate(`/booking/${activeBooking.id || activeBooking._id}`);
    }
  }, [createSuccess, activeBooking, dispatch, navigate]);

  const filteredWorkers = (selectedCategory
    ? workers.filter(w => (w.profile?.specialty || '').toLowerCase().includes(selectedCategory.slug || selectedCategory.name?.toLowerCase() || ''))
    : workers
  ).filter(w =>
    !search || w.name.toLowerCase().includes(search.toLowerCase()) || (w.profile?.specialty || '').toLowerCase().includes(search.toLowerCase())
  );

  const canProceed = [
    !!selectedCategory,
    !!selectedProvider,
    !!selectedDate && !!selectedSlot,
    !!description.trim() && description.length >= 10,
  ];

  const handleSubmit = async () => {
    if (!description.trim() || description.length < 10) {
      toast.error('Please describe the issue (at least 10 characters)');
      return;
    }
    const scheduledAt = new Date(`${selectedDate.iso}T${selectedSlot.time}:00`);
    await dispatch(createBooking({
      token: accessToken,
      data: {
        providerId: selectedProvider.id || selectedProvider._id,
        categoryId: selectedCategory.id || selectedCategory._id,
        description,
        address: { formatted: address },
        scheduledAt: scheduledAt.toISOString(),
        estimatedDuration: duration,
        currency: selected,
      },
    }));
  };

  const hourlyRate = selectedProvider?.profile?.hourlyRate || 0;
  const estimatedTotal = hourlyRate * duration;

  if (dataLoading) {
    return (
      <div className="loading-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '40px', height: '40px' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading services...</p>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade">
      {/* Progress Header */}
      <div className="booking-flow-header">
        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Book a Service</h1>
        <div className="booking-steps">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`booking-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                <div className="step-circle">
                  {i < step ? <Check size={14} /> : <span>{i + 1}</span>}
                </div>
                <span className="step-label">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`step-connector ${i < step ? 'done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="booking-flow-body">
        {/* ── Step 0: Choose Category ── */}
        {step === 0 && (
          <div className="booking-step-content animate-fade">
            <h2 className="step-title">What service do you need?</h2>
            <p className="step-subtitle">Choose a service category to find verified specialists</p>
            <div className="category-grid">
              {categories.map(cat => (
                <button
                  key={cat.id || cat._id}
                  className={`category-option ${selectedCategory?.id === cat.id || selectedCategory?._id === cat._id ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <div className="category-option-icon">{getIcon(cat.iconName)}</div>
                  <h3>{cat.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Background Verified</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Choose Provider ── */}
        {step === 1 && (
          <div className="booking-step-content animate-fade">
            <h2 className="step-title">Select a {selectedCategory?.name} Specialist</h2>
            <p className="step-subtitle">{filteredWorkers.length} verified providers available</p>

            <div className="booking-search-bar">
              <Search size={18} style={{ color: 'var(--text-muted)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or specialty..." className="booking-search-input" />
            </div>

            <div className="provider-selection-grid">
              {filteredWorkers.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <AlertCircle size={36} style={{ opacity: 0.3 }} />
                  <p>No providers found for this category</p>
                </div>
              ) : (
                filteredWorkers.map(worker => {
                  const isSelected = (selectedProvider?.id || selectedProvider?._id) === (worker.id || worker._id);
                  return (
                    <button
                      key={worker.id || worker._id}
                      className={`provider-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedProvider(worker)}
                    >
                      <img
                        src={worker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=e5e7eb&color=374151&size=80`}
                        alt={worker.name}
                        className="provider-option-avatar"
                      />
                      <div className="provider-option-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong>{worker.name}</strong>
                          {isSelected && <Check size={14} style={{ color: 'var(--primary)' }} />}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>{worker.profile?.specialty?.toUpperCase() || 'SPECIALIST'}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Star size={12} fill="#f59e0b" stroke="#f59e0b" /> {worker.profile?.rating?.toFixed(1) || '—'}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Navigation size={12} /> {worker.profile?.serviceRadius || 15}km radius
                          </span>
                        </div>
                        <div style={{ marginTop: '0.4rem', fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {formatPrice(worker.profile?.hourlyRate || 0, rates, selected, currencies)}<span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--text-muted)' }}>/hr</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: Schedule ── */}
        {step === 2 && (
          <div className="booking-step-content animate-fade">
            <h2 className="step-title">Pick a Date & Time</h2>
            <p className="step-subtitle">Select when you'd like {selectedProvider?.name} to come</p>

            {/* Date Picker */}
            <div className="date-strip">
              {dates.map(d => (
                <button
                  key={d.iso}
                  className={`date-chip ${selectedDate?.iso === d.iso ? 'selected' : ''}`}
                  onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                >
                  <span className="date-chip-month">{d.month}</span>
                  <span className="date-chip-day">{d.day}</span>
                  <span className="date-chip-label">{d.label}</span>
                </button>
              ))}
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                  <Clock size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: 'var(--primary)' }} />
                  Available Slots — {format(selectedDate.date, 'EEEE, MMMM d')}
                </h4>
                {slotsLoading ? (
                  <div className="loading-center">
                    <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '24px', height: '24px' }} />
                  </div>
                ) : (
                  <div className="slots-grid">
                    {slots.map(slot => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        className={`slot-chip ${selectedSlot?.time === slot.time ? 'selected' : ''} ${!slot.available ? 'unavailable' : ''}`}
                        onClick={() => slot.available && setSelectedSlot(slot)}
                      >
                        {slot.label}
                      </button>
                    ))}
                    {slots.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', gridColumn: '1 / -1' }}>
                        No available slots for this day.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Duration */}
            <div style={{ marginTop: '2rem' }}>
              <label className="form-label">Estimated Duration</label>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {[1, 2, 3, 4, 6, 8].map(h => (
                  <button
                    key={h}
                    className={`slot-chip ${duration === h ? 'selected' : ''}`}
                    onClick={() => setDuration(h)}
                  >
                    {h}hr
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Confirm ── */}
        {step === 3 && (
          <div className="booking-step-content animate-fade">
            <h2 className="step-title">Review & Confirm</h2>
            <p className="step-subtitle">Review your booking details before submitting</p>

            {bookingError && (
              <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
                <AlertCircle size={16} /> {bookingError}
              </div>
            )}

            <div className="confirm-summary">
              {/* Service + Provider */}
              <div className="confirm-row">
                <span className="confirm-label">Service</span>
                <span className="confirm-value">{selectedCategory?.name}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Provider</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <img
                    src={selectedProvider?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedProvider?.name || 'P')}&size=40&background=e5e7eb&color=374151`}
                    alt={selectedProvider?.name}
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                  />
                  <span className="confirm-value">{selectedProvider?.name}</span>
                </div>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Scheduled</span>
                <span className="confirm-value">
                  {selectedDate && format(selectedDate.date, 'MMMM d, yyyy')} at {selectedSlot?.label}
                </span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Duration</span>
                <span className="confirm-value">{duration} hour{duration > 1 ? 's' : ''}</span>
              </div>

              <div className="confirm-divider" />

              {/* Description */}
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label className="form-label">Describe the Issue *</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Please describe the problem in detail. Include any relevant information that will help the provider prepare..."
                  style={{ resize: 'vertical' }}
                />
                <small style={{ color: description.length < 10 ? 'var(--danger)' : 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {description.length}/10 min characters
                </small>
              </div>

              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label className="form-label">
                  <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                  Service Address
                </label>
                <input
                  className="form-input"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Enter your full service address..."
                />
              </div>

              <div className="confirm-divider" />

              {/* Cost Estimate */}
              <div className="confirm-cost-card">
                <div className="confirm-row">
                  <span className="confirm-label">Rate</span>
                  <span>{formatPrice(hourlyRate, rates, selected, currencies)}/hr</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-label">Duration</span>
                  <span>{duration}hr</span>
                </div>
                <div className="confirm-divider" />
                <div className="confirm-row" style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                  <span>Estimated Total</span>
                  <span style={{ color: 'var(--primary)' }}>{formatPrice(estimatedTotal, rates, selected, currencies)}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  * Final amount may vary based on actual time and materials used
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="booking-nav">
          {step > 0 && (
            <button className="btn btn-outline" onClick={() => setStep(s => s - 1)} disabled={loading}>
              <ChevronLeft size={18} /> Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed[step]}
              id={`booking-next-step-${step}`}
            >
              Continue <ChevronRight size={18} />
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading || !description.trim() || description.length < 10}
              id="confirm-booking-btn"
              style={{ minWidth: '160px' }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: 'white' }} /> Booking...</>
              ) : (
                <><Check size={18} /> Confirm Booking</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
