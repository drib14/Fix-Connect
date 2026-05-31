import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Clock,
  DollarSign,
  Star,
  CheckCircle,
  Briefcase,
  AlertCircle,
  User,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Check,
  X,
  TrendingUp,
  Wifi,
  WifiOff,
  BellRing,
} from 'lucide-react';
import ModalDrawer from '../components/ModalDrawer';

const WorkerDashboard = ({ user, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Ride-Hailing Offer Countdown states
  const [activeOffer, setActiveOffer] = useState(null);
  const [offerTimer, setOfferTimer] = useState(15);

  const API_URL = 'http://localhost:5050/api';

  useEffect(() => {
    fetchProfileAndBookings();
    
    // Poll bookings list every 4 seconds to simulate real-time ride offer dispatches
    const polling = setInterval(fetchBookingsSilent, 4000);
    return () => clearInterval(polling);
  }, []);

  // Dispatch offer checks on bookings update
  useEffect(() => {
    if (!profile || !profile.availability) {
      setActiveOffer(null);
      return;
    }

    const firstPending = bookings.find((b) => b.status === 'pending');
    if (firstPending) {
      if (!activeOffer || activeOffer._id !== firstPending._id) {
        setActiveOffer(firstPending);
        setOfferTimer(15);
      }
    } else {
      setActiveOffer(null);
    }
  }, [bookings, profile]);

  // Tick the 15-second incoming offer countdown
  useEffect(() => {
    if (!activeOffer) return;

    if (offerTimer <= 0) {
      // Auto decline when timer expires
      handleUpdateBookingStatus(activeOffer._id, 'rejected');
      setActiveOffer(null);
      return;
    }

    const counter = setTimeout(() => {
      setOfferTimer((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(counter);
  }, [offerTimer, activeOffer]);

  const fetchProfileAndBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('fixconnect_token');
      
      const meResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meResponse.data.success) {
        setProfile(meResponse.data.workerProfile);
      }

      const bookingsResponse = await axios.get(`${API_URL}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (bookingsResponse.data.success) {
        setBookings(bookingsResponse.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching worker dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Silent polling to keep bookings list fresh without toggling global spinners
  const fetchBookingsSilent = async () => {
    try {
      const token = localStorage.getItem('fixconnect_token');
      const bookingsResponse = await axios.get(`${API_URL}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (bookingsResponse.data.success) {
        setBookings(bookingsResponse.data.bookings);
      }
    } catch (err) {
      console.error('Silent fetch bookings failed:', err.message);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const token = localStorage.getItem('fixconnect_token');
      const response = await axios.put(
        `${API_URL}/workers/availability`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setProfile((prev) => ({ ...prev, availability: response.data.availability }));
        if (!response.data.availability) {
          setActiveOffer(null); // Clear active offer popup immediately if offline
        }
      }
    } catch (err) {
      alert('Failed to change availability.');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('fixconnect_token');
      const response = await axios.put(
        `${API_URL}/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setIsDetailOpen(false);
        setActiveOffer(null);
        fetchProfileAndBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleOpenBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailOpen(true);
  };

  // Aggregated analytics
  const totalEarnings = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, curr) => sum + curr.totalAmount, 0);

  const activeJobs = bookings.filter((b) => ['accepted', 'in_progress'].includes(b.status));

  // Circular progress ring circumference calculation (r=30, C=2*pi*r = 188.4)
  const strokeDashoffset = activeOffer ? 188.4 - (offerTimer / 15) * 188.4 : 0;

  return (
    <div style={{ minHeight: '90vh', paddingBottom: '60px' }}>
      
      {/* FULLSCREEN DRIVER RIDE-OFFER ALERT MODAL */}
      {activeOffer && profile && profile.availability && (
        <div className="driver-offer-overlay">
          <div className="driver-offer-card pulsing-alert-ring">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fef2f2',
                  padding: '16px',
                  borderRadius: '50%',
                  color: '#ef4444',
                  marginBottom: '16px',
                }}
              >
                <BellRing size={36} className="animate-bounce" />
              </div>
              <h3 style={{ fontSize: '22px', fontFamily: 'Outfit', color: '#1e293b' }}>
                New Service Dispatch!
              </h3>
              <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: '800', marginTop: '2px', textTransform: 'uppercase' }}>
                {activeOffer.category} Job Request
              </p>
            </div>

            {/* Client Coordinates and billing info */}
            <div
              style={{
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '20px',
                padding: '20px',
                marginBottom: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img
                  src={activeOffer.customerId?.avatar}
                  alt="Customer"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '15px', color: '#1e293b' }}>{activeOffer.customerId?.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '12px' }}>
                    <MapPin size={12} color="#10b981" />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                      {activeOffer.address}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '12px',
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>EST. FARE</span>
                  <strong style={{ fontSize: '20px', color: '#10b981' }}>${activeOffer.totalAmount}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>SCHEDULE</span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b' }}>
                    {activeOffer.bookingTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Ticking Progress Circle Ring */}
            <div className="countdown-ring-container" style={{ marginBottom: '28px' }}>
              <svg className="countdown-svg">
                <circle cx="40" cy="40" r="30" className="countdown-circle-bg" />
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  className="countdown-circle-progress"
                  strokeDasharray="188.4"
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="countdown-text">{offerTimer}</div>
            </div>

            {/* Offer action responses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ borderColor: '#fee2e2', color: '#ef4444', background: '#fef2f2' }}
                onClick={() => handleUpdateBookingStatus(activeOffer._id, 'rejected')}
              >
                Decline
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}
                onClick={() => handleUpdateBookingStatus(activeOffer._id, 'accepted')}
              >
                Accept Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Panel */}
      <header
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 28px',
          borderRadius: '0 0 20px 20px',
          marginBottom: '32px',
          transform: 'none',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '20px', color: '#0f172a' }}>FixConnect</h2>
          <p style={{ color: '#64748b', fontSize: '13px' }}>
            Professional Portal &bull; <strong style={{ color: '#10b981' }}>{user.name}</strong>
          </p>
        </div>

        {/* GO ONLINE / OFFLINE Switcher */}
        {profile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '24px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {profile.availability ? <Wifi size={16} color="#10b981" /> : <WifiOff size={16} color="#64748b" />}
              <strong>{profile.availability ? 'ONLINE' : 'OFFLINE'}</strong>
            </span>
            <button
              onClick={handleToggleAvailability}
              style={{
                width: '54px',
                height: '28px',
                borderRadius: '99px',
                background: profile.availability ? '#10b981' : '#cbd5e1',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  position: 'absolute',
                  top: '3px',
                  left: profile.availability ? '29px' : '3px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              />
            </button>
          </div>
        )}

        <button
          onClick={onLogout}
          className="btn btn-danger"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          Sign Out
        </button>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* DRIVER OFFLINE BLUR LAYOUT overlay wrapping dashboard */}
        <div className={profile && !profile.availability ? 'offline-overlay' : ''}>
          
          {/* Verification banner alert */}
          {profile && !profile.isVerifiedByAdmin && (
            <div
              style={{
                background: '#fffbeb',
                border: '1.5px dashed #fcd34d',
                color: '#b45309',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '32px',
                fontSize: '14px',
              }}
            >
              <AlertCircle size={20} color="#b45309" />
              <div>
                <strong>Awaiting Professional Verification</strong>
                <p style={{ fontSize: '12px', color: '#d97706', marginTop: '2px' }}>
                  Your certification documents have been submitted to administrative review. You will appear in customer distance searches once checked.
                </p>
              </div>
            </div>
          )}

          {profile && profile.isVerifiedByAdmin && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1.5px dashed #a7f3d0',
                color: '#047857',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '32px',
                fontSize: '14px',
              }}
            >
              <CheckCircle size={20} color="#10b981" />
              <div>
                <strong>Verified Professional Account</strong>
                <p style={{ fontSize: '12px', color: '#059669', marginTop: '2px' }}>
                  Your account is fully approved! You are currently visible in public lists. Keep toggling availability to receive dispatches.
                </p>
              </div>
            </div>
          )}

          {/* METRICS DECK */}
          {profile && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '40px',
              }}
            >
              <div className="glass-card" style={{ padding: '24px', transform: 'none' }}>
                <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={16} color="#10b981" /> Total Earned Revenue
                </span>
                <h2 style={{ fontSize: '32px', color: '#10b981', marginTop: '8px' }}>${totalEarnings.toFixed(2)}</h2>
              </div>

              <div className="glass-card" style={{ padding: '24px', transform: 'none' }}>
                <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={16} color="#10b981" /> Dispatch Offers Queue
                </span>
                <h2 style={{ fontSize: '32px', color: '#0f172a', marginTop: '8px' }}>
                  {bookings.filter((b) => b.status === 'pending').length} Requests
                </h2>
              </div>

              <div className="glass-card" style={{ padding: '24px', transform: 'none' }}>
                <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} color="#10b981" /> Active Engagements
                </span>
                <h2 style={{ fontSize: '32px', color: '#0f172a', marginTop: '8px' }}>{activeJobs.length} In Transit</h2>
              </div>

              <div className="glass-card" style={{ padding: '24px', transform: 'none' }}>
                <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={16} color="#d97706" /> Expert Rating Score
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <h2 style={{ fontSize: '32px', color: '#d97706' }}>{profile.rating}</h2>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>({profile.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
          )}

          {/* TASK MANAGEMENT */}
          <div className="glass-card" style={{ padding: '32px', transform: 'none' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '24px', color: '#0f172a' }}>Active Job Assignments</h3>

            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                <Briefcase size={36} color="#cbd5e1" style={{ margin: '0 auto 12px auto' }} />
                <h4>No Bookings Listed</h4>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>
                  You don't have any active dispatches. Keep ONLINE wifi switches turned on!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bookings.map((booking) => {
                  const formattedDate = new Date(booking.bookingDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={booking._id}
                      style={{
                        border: '1px solid #cbd5e1',
                        borderRadius: '16px',
                        padding: '20px',
                        background: '#ffffff',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '16px',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      {/* Customer Info */}
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: 1, minWidth: '220px' }}>
                        <img
                          src={booking.customerId?.avatar}
                          alt="Customer"
                          style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <h4 style={{ fontSize: '15px' }}>{booking.customerId?.name}</h4>
                          <span style={{ fontSize: '12px', color: '#64748b', display: 'block', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '200px' }}>
                            {booking.address}
                          </span>
                        </div>
                      </div>

                      {/* Schedule */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '160px' }}>
                        <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} color="#10b981" />
                          {formattedDate}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} color="#10b981" />
                          {booking.bookingTime}
                        </span>
                      </div>

                      {/* Cost */}
                      <div style={{ minWidth: '90px' }}>
                        <strong style={{ fontSize: '18px', color: '#10b981' }}>${booking.totalAmount}</strong>
                        <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Estimated bill</span>
                      </div>

                      {/* Status badge */}
                      <div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            background:
                              booking.status === 'completed'
                                ? '#f0fdf4'
                                : booking.status === 'in_progress'
                                ? '#ecfdf5'
                                : booking.status === 'pending'
                                ? '#f8fafc'
                                : '#fef2f2',
                            color:
                              booking.status === 'completed'
                                ? '#10b981'
                                : booking.status === 'in_progress'
                                ? '#059669'
                                : booking.status === 'pending'
                                ? '#64748b'
                                : '#ef4444',
                          }}
                        >
                          {booking.status}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenBookingDetails(booking)}
                          className="btn btn-secondary"
                          style={{ padding: '8px 12px', fontSize: '12px' }}
                        >
                          <Eye size={14} />
                          View Offer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* DETAILED BOOKING DIALOG FOR WORKER */}
      <ModalDrawer
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Job Assignment Information"
      >
        {selectedBooking && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
              <img
                src={selectedBooking.customerId?.avatar}
                alt="Client"
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '16px', color: '#0f172a' }}>{selectedBooking.customerId?.name}</h4>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  <a
                    href={`tel:${selectedBooking.customerId?.phone}`}
                    style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}
                  >
                    <Phone size={12} />
                    {selectedBooking.customerId?.phone || 'No phone'}
                  </a>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} />
                    {selectedBooking.address}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '6px', color: '#0f172a' }}>Job issue description:</h4>
              <p style={{ color: '#64748b', fontSize: '13px', background: '#f1f5f9', padding: '12px 16px', borderRadius: '12px' }}>
                {selectedBooking.description}
              </p>
            </div>

            {selectedBooking.images && selectedBooking.images.length > 0 && (
              <div>
                <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#0f172a' }}>Client site photos:</h4>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                  {selectedBooking.images.map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt="Job Snapshot"
                      style={{ height: '80px', width: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              {selectedBooking.status === 'pending' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    onClick={() => handleUpdateBookingStatus(selectedBooking._id, 'rejected')}
                    className="btn btn-danger"
                    style={{ padding: '12px' }}
                  >
                    <X size={16} /> Decline Request
                  </button>
                  <button
                    onClick={() => handleUpdateBookingStatus(selectedBooking._id, 'accepted')}
                    className="btn btn-primary"
                    style={{ padding: '12px' }}
                  >
                    <Check size={16} /> Accept Booking
                  </button>
                </div>
              )}

              {selectedBooking.status === 'accepted' && (
                <button
                  onClick={() => handleUpdateBookingStatus(selectedBooking._id, 'in_progress')}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  Go Online: Navigate to Customer Location
                </button>
              )}

              {selectedBooking.status === 'in_progress' && (
                <button
                  onClick={() => handleUpdateBookingStatus(selectedBooking._id, 'completed')}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  I have Completed the Service
                </button>
              )}

              {selectedBooking.status === 'completed' && (
                <div style={{ textAlign: 'center', color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px' }}>
                  <CheckCircle size={18} />
                  <span>Service Completed successfully</span>
                </div>
              )}
            </div>
          </div>
        )}
      </ModalDrawer>
    </div>
  );
};

export default WorkerDashboard;
