import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { SkeletonCard } from '../components/Skeleton';
import ModalDrawer from '../components/ModalDrawer';
import {
  Search,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  RotateCw,
  Sparkles,
  Wrench,
  Zap,
  Tv,
  Hammer,
  Leaf,
  Navigation,
} from 'lucide-react';

const ClientDashboard = ({ user, onLogout }) => {
  // Discovery states
  const [workers, setWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState(30);

  // Selected Worker & Booking states
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  // Booking Form states
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [jobDescription, setJobDescription] = useState('');
  const [jobFiles, setJobFiles] = useState([]);
  
  // Payment states
  const [paymentStep, setPaymentStep] = useState(false); 
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingIdForPay, setBookingIdForPay] = useState(null);

  // Active bookings list
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState('explore'); 

  // Ride-Hailing Radar search states
  const [isMatchingActive, setIsMatchingActive] = useState(false);
  const [matchingProgressText, setMatchingProgressText] = useState('');

  // Review states
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewTextInput, setReviewTextInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // API URL updated to port 5050 to resolve EADDRINUSE conflict
  const API_URL = 'http://localhost:5050/api';

  useEffect(() => {
    fetchWorkers();
    fetchBookings();
  }, [activeCategory, maxDistance]);

  const fetchWorkers = async () => {
    setLoadingWorkers(true);
    try {
      const lat = user.location?.coordinates?.[1] || 14.5995;
      const lng = user.location?.coordinates?.[0] || 121.0494;
      
      const response = await axios.get(
        `${API_URL}/workers/search?category=${activeCategory}&lat=${lat}&lng=${lng}&maxDist=${maxDistance}&search=${searchQuery}`
      );
      if (response.data.success) {
        setWorkers(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching workers:', err.message);
    } finally {
      setLoadingWorkers(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const token = localStorage.getItem('fixconnect_token');
      const response = await axios.get(`${API_URL}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setMyBookings(response.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err.message);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWorkers();
  };

  const handleOpenDetails = (worker) => {
    setSelectedWorker(worker);
    setIsDetailOpen(true);
  };

  const handleStartBooking = () => {
    setIsDetailOpen(false);
    setIsBookingOpen(true);
    setPaymentStep(false);
    setBookingDate('');
    setJobDescription('');
    setJobFiles([]);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setJobFiles(Array.from(e.target.files));
    }
  };

  const handleBookingDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate || !jobDescription) {
      alert('Please fill in booking date and description.');
      return;
    }

    setLoadingWorkers(true);
    try {
      const token = localStorage.getItem('fixconnect_token');
      const formData = new FormData();
      formData.append('workerId', selectedWorker.userId);
      formData.append('category', selectedWorker.skills[0] || 'General');
      formData.append('bookingDate', bookingDate);
      formData.append('bookingTime', bookingTime);
      formData.append('description', jobDescription);
      formData.append('address', user.address);
      formData.append('longitude', user.location?.coordinates?.[0] || 0);
      formData.append('latitude', user.location?.coordinates?.[1] || 0);
      
      const totalAmount = selectedWorker.hourlyRate * 2;
      formData.append('totalAmount', totalAmount);

      jobFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await axios.post(`${API_URL}/bookings`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setBookingIdForPay(response.data.booking._id);
        setPaymentStep(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initialize booking.');
    } finally {
      setLoadingWorkers(false);
    }
  };

  const handlePayMongoSubmit = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);

    try {
      const token = localStorage.getItem('fixconnect_token');
      const response = await axios.post(
        `${API_URL}/payments/checkout`,
        {
          bookingId: bookingIdForPay,
          paymentMethod: 'card',
          cardNumber,
          cardName,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setPaymentSuccess(true);
        setTimeout(() => {
          setIsBookingOpen(false);
          setPaymentStep(false);
          setPaymentSuccess(false);
          
          // Trigger the Ride-Hailing Radar search screens
          setIsMatchingActive(true);
          setMatchingProgressText(`Broadcasting your request to ${selectedWorker.name || 'nearest provider'}...`);
          
          setTimeout(() => {
            setMatchingProgressText(`Matching complete! ${selectedWorker.name} accepted your request.`);
            
            setTimeout(() => {
              setIsMatchingActive(false);
              setActiveTab('bookings');
              fetchBookings();
            }, 1800);
          }, 2000);

        }, 1200);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment simulation failed.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const token = localStorage.getItem('fixconnect_token');
      const response = await axios.put(
        `${API_URL}/bookings/${bookingId}/status`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const handleOpenReview = (bookingId) => {
    setReviewBookingId(bookingId);
    setIsReviewOpen(true);
    setRatingInput(5);
    setReviewTextInput('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);

    try {
      const token = localStorage.getItem('fixconnect_token');
      const response = await axios.post(
        `${API_URL}/bookings/${reviewBookingId}/review`,
        {
          rating: ratingInput,
          reviewText: reviewTextInput,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setIsReviewOpen(false);
        fetchBookings();
        fetchWorkers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getCategoryIcon = (slug) => {
    switch (slug.toLowerCase()) {
      case 'plumbing':
        return <Wrench size={18} />;
      case 'electrical':
        return <Zap size={18} />;
      case 'cleaning':
        return <Sparkles size={18} />;
      case 'appliance':
        return <Tv size={18} />;
      case 'carpentry':
        return <Hammer size={18} />;
      case 'gardening':
        return <Leaf size={18} />;
      default:
        return <Wrench size={18} />;
    }
  };

  return (
    <div style={{ minHeight: '90vh', paddingBottom: '60px' }}>
      
      {/* RIDE-HAILING RADAR MATCHING OVERLAY */}
      {isMatchingActive && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.95)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div className="matching-radar" style={{ marginBottom: '32px' }}>
            <div className="radar-ping"></div>
            <div className="radar-ping"></div>
            <div className="radar-ping"></div>
            <div className="radar-center-logo">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                width="36"
                height="36"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
          </div>
          <h2 style={{ fontSize: '26px', color: '#10b981', marginBottom: '8px', fontFamily: 'Outfit' }}>
            Finding Nearby Experts...
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '380px' }}>
            {matchingProgressText}
          </p>
        </div>
      )}

      {/* Top Header Bar */}
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
            Logged in as <strong style={{ color: '#10b981' }}>{user.name}</strong>
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '12px', marginRight: '24px' }}>
          <button
            className={`btn ${activeTab === 'explore' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => setActiveTab('explore')}
          >
            Explore Experts
          </button>
          <button
            className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings ({myBookings.length})
          </button>
        </div>

        <button
          onClick={onLogout}
          className="btn btn-danger"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          Sign Out
        </button>
      </header>

      {/* EXPLORE PAGE TAB */}
      {activeTab === 'explore' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          {/* Search and Filters pane */}
          <div
            className="glass-card"
            style={{ padding: '24px', marginBottom: '32px', transform: 'none' }}
          >
            <form
              onSubmit={handleSearchSubmit}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 2, minWidth: '260px', position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search professional title, skills or bio..."
                  style={{ paddingLeft: '44px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#10b981',
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap' }}>
                  Radius: <strong>{maxDistance} km</strong>
                </span>
                <input
                  type="range"
                  min="5"
                  max="100"
                  style={{ flex: 1, accentColor: '#10b981' }}
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px' }}>
                Search Experts
              </button>
            </form>

            {/* Horizontal Categories Row */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                marginTop: '20px',
                paddingBottom: '8px',
              }}
            >
              <button
                style={{
                  padding: '8px 16px',
                  borderRadius: '99px',
                  border: '1.5px solid',
                  borderColor: activeCategory === '' ? '#10b981' : '#cbd5e1',
                  background: activeCategory === '' ? '#f0fdf4' : 'transparent',
                  color: activeCategory === '' ? '#10b981' : '#64748b',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => setActiveCategory('')}
              >
                All Experts
              </button>
              {['Plumbing', 'Electrical', 'Cleaning', 'Appliance', 'Carpentry', 'Gardening'].map((cat) => {
                const isSelected = activeCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '99px',
                      border: '1.5px solid',
                      borderColor: isSelected ? '#10b981' : '#cbd5e1',
                      background: isSelected ? '#f0fdf4' : 'transparent',
                      color: isSelected ? '#10b981' : '#64748b',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => setActiveCategory(cat.toLowerCase())}
                  >
                    {getCategoryIcon(cat)}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workers Grid */}
          {loadingWorkers ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : workers.length === 0 ? (
            <div
              className="glass-card"
              style={{
                textAlign: 'center',
                padding: '60px 24px',
                color: '#64748b',
                transform: 'none',
              }}
            >
              <AlertCircle size={44} color="#cbd5e1" style={{ margin: '0 auto 16px auto' }} />
              <h3>No Service Providers Found</h3>
              <p style={{ marginTop: '8px' }}>
                Try adjusting your search criteria, widening your radius or clearing category filters.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
              }}
            >
              {workers.map((worker) => (
                <div
                  key={worker.userId}
                  className="glass-card"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <img
                        src={worker.avatar}
                        alt={worker.name}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #10b981',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '17px', color: '#0f172a' }}>{worker.name}</h4>
                        <span
                          style={{
                            fontSize: '12px',
                            color: '#10b981',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                          }}
                        >
                          {worker.title}
                        </span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p
                      style={{
                        color: '#64748b',
                        fontSize: '13px',
                        margin: '16px 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {worker.bio}
                    </p>

                    {/* Skills list tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {worker.skills.map((skill) => (
                        <span
                          key={skill}
                          style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            color: '#64748b',
                            textTransform: 'capitalize',
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Stats & Booking */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '16px',
                        borderTop: '1px solid #f1f5f9',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        {worker.distance !== null && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '12px' }}>
                            <MapPin size={14} color="#10b981" />
                            <span>{worker.distance} km</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                          <Star size={14} fill="#d97706" color="#d97706" />
                          <strong style={{ color: '#0f172a' }}>{worker.rating}</strong>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>({worker.reviewCount})</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Hourly Price</span>
                        <strong style={{ color: '#10b981', fontSize: '18px' }}>${worker.hourlyRate}/hr</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenDetails(worker)}
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '16px', padding: '10px' }}
                    >
                      View Profile & Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MY BOOKINGS TAB (WITH LIVE RIDE-HAILING TRACKING MAP) */}
      {activeTab === 'bookings' && (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          <h3 style={{ fontSize: '22px', marginBottom: '24px', color: '#0f172a' }}>Active Service Engagements</h3>

          {loadingBookings ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2].map((i) => (
                <div key={i} className="skeleton-card glass-card" style={{ height: '140px' }} />
              ))}
            </div>
          ) : myBookings.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b', transform: 'none' }}>
              <Calendar size={40} color="#cbd5e1" style={{ margin: '0 auto 12px auto' }} />
              <h4>No Bookings Found</h4>
              <p style={{ fontSize: '14px', marginTop: '6px' }}>
                You have not ordered any home services yet. Go to 'Explore Experts' to book!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {myBookings.map((booking) => {
                const formattedDate = new Date(booking.bookingDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                // Check if the order is accepted or actively in progress to show dynamic tracking map
                const isTrackingActive = ['accepted', 'in_progress'].includes(booking.status);

                return (
                  <div
                    key={booking._id}
                    className="glass-card"
                    style={{ padding: '24px', transform: 'none' }}
                  >
                    
                    {/* RIDE-HAILING INTERACTIVE SVG GEOLOCATION MAP */}
                    {isTrackingActive && (
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <Navigation size={18} className="animate-pulse" style={{ color: '#10b981' }} />
                          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                            {booking.status === 'in_progress' 
                              ? 'Live Status: Technician is arriving at your location...'
                              : 'Live Status: Preparing equipment and routing route path...'}
                          </h4>
                        </div>
                        
                        <div className="map-canvas-container">
                          <div className="map-road-grid"></div>
                          
                          <svg viewBox="0 0 500 240" className="map-route-path">
                            {/* Road pathways lines background */}
                            <path 
                              d="M 50,40 L 450,40 M 50,120 L 450,120 M 50,200 L 450,200 M 100,20 L 100,220 M 250,20 L 250,220 M 400,20 L 400,220" 
                              stroke="rgba(255,255,255,0.06)" 
                              strokeWidth="8" 
                              strokeLinecap="round" 
                            />
                            
                            {/* Highlighted active route path from technician starting coordinates to client home */}
                            <path 
                              id="active-route" 
                              d="M 100,40 L 250,40 L 250,120 L 400,120 L 400,200" 
                              fill="none" 
                              stroke="none" 
                            />
                            
                            <path 
                              d="M 100,40 L 250,40 L 250,120 L 400,120 L 400,200" 
                              fill="none" 
                              className="path-stroke" 
                              strokeWidth="4" 
                              strokeLinecap="round" 
                            />
                            
                            {/* Client destination Pin */}
                            <g transform="translate(400, 200)">
                              <circle r="16" fill="#10b981" opacity="0.25" className="animate-ping" style={{ animation: 'radarPing 2.5s infinite' }} />
                              <circle r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                            </g>
                            <text x="400" y="230" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="middle">
                              Sarah's Residence
                            </text>
                            
                            {/* Worker Vehicle node translating along route */}
                            <g>
                              {booking.status === 'in_progress' ? (
                                <animateMotion dur="8s" repeatCount="indefinite" path="M 100,40 L 250,40 L 250,120 L 400,120 L 400,200" />
                              ) : (
                                // Parked at start node (100, 40)
                                <animateMotion dur="0s" fill="freeze" path="M 100,40 L 100,40" />
                              )}
                              
                              <circle r="18" fill="#10b981" opacity="0.3" />
                              <circle r="12" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                              {/* Wrench icon shape inside moving circle */}
                              <path 
                                d="M-4,-4 L4,4 M2,-4 L4,-2 M-4,2 L-2,4" 
                                stroke="#ffffff" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                              />
                            </g>
                            <text x="100" y="24" fill="#cbd5e1" fontSize="9" textAnchor="middle">
                              {booking.workerId?.name || 'Technician'}
                            </text>
                          </svg>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <img
                          src={booking.workerId?.avatar}
                          alt="Professional Avatar"
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <h4 style={{ fontSize: '16px' }}>{booking.workerId?.name || 'Professional'}</h4>
                          <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', color: '#64748b', textTransform: 'capitalize' }}>
                            {booking.category}
                          </span>
                        </div>
                      </div>

                      {/* Scheduling */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                          <Calendar size={14} color="#10b981" />
                          <span>{formattedDate}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                          <Clock size={14} color="#10b981" />
                          <span>{booking.bookingTime}</span>
                        </div>
                      </div>

                      {/* Price & Payments */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <strong style={{ fontSize: '18px', color: '#10b981' }}>${booking.totalAmount}</strong>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '3px 8px',
                            borderRadius: '99px',
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            background: booking.paymentStatus === 'paid' ? '#f0fdf4' : '#fffbeb',
                            color: booking.paymentStatus === 'paid' ? '#10b981' : '#d97706',
                          }}
                        >
                          {booking.paymentStatus}
                        </span>
                      </div>

                      {/* Job Order Status Timelines */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Status State</span>
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
                    </div>

                    <p style={{ fontSize: '13px', color: '#64748b', margin: '16px 0', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px' }}>
                      <strong>Job Issue:</strong> {booking.description}
                    </p>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'end' }}>
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="btn btn-danger"
                          style={{ padding: '8px 16px', fontSize: '13px' }}
                        >
                          Cancel Booking
                        </button>
                      )}

                      {booking.status === 'completed' && booking.rating === null && (
                        <button
                          onClick={() => handleOpenReview(booking._id)}
                          className="btn btn-primary"
                          style={{ padding: '8px 16px', fontSize: '13px' }}
                        >
                          Write Service Review
                        </button>
                      )}

                      {booking.status === 'completed' && booking.rating !== null && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#10b981', fontWeight: 'bold' }}>
                          <CheckCircle size={16} />
                          <span>Reviewed ({booking.rating}/5 Stars)</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DETAILED WORKER MODAL */}
      <ModalDrawer
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Professional Information"
      >
        {selectedWorker && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
              <img
                src={selectedWorker.avatar}
                alt={selectedWorker.name}
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }}
              />
              <h3 style={{ fontSize: '20px' }}>{selectedWorker.name}</h3>
              <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' }}>
                {selectedWorker.title}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', marginTop: '4px' }}>
                <Star size={16} fill="#d97706" color="#d97706" />
                <strong style={{ color: '#0f172a' }}>{selectedWorker.rating}</strong>
                <span style={{ color: '#64748b', fontSize: '12px' }}>({selectedWorker.reviewCount} customer reviews)</span>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '6px', color: '#0f172a' }}>Professional Biography</h4>
              <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6' }}>{selectedWorker.bio}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Working Hours</span>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Clock size={14} color="#10b981" />
                  {selectedWorker.workingHours?.start} - {selectedWorker.workingHours?.end}
                </span>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Base Hourly Rate</span>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <DollarSign size={14} color="#10b981" />
                  ${selectedWorker.hourlyRate}/hour
                </span>
              </div>
            </div>

            <button
              onClick={handleStartBooking}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '12px' }}
            >
              Book Service (Starts at ${selectedWorker.hourlyRate * 2} min.)
            </button>
          </div>
        )}
      </ModalDrawer>

      {/* BOOKING FLOW MODAL & PAYMONGO CHECKOUT */}
      <ModalDrawer
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        title={paymentStep ? 'PayMongo Secure Checkout' : 'Book Professional'}
      >
        {selectedWorker && (
          <div>
            {!paymentStep ? (
              <form onSubmit={handleBookingDetailsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Service Type Tag</label>
                  <input
                    type="text"
                    className="form-input"
                    disabled
                    value={selectedWorker.skills[0] || 'Home Repair'}
                    style={{ textTransform: 'capitalize', background: '#f1f5f9' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preferred Time Slot</label>
                    <input
                      type="time"
                      className="form-input"
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Job Details & Problem Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    required
                    style={{ resize: 'none' }}
                    placeholder="Provide details about the issue (e.g. toilet leak, breaker tripping)..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Problem Snapshots (Optional)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="form-input"
                    onChange={handleFileChange}
                  />
                </div>

                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #d1fae5',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px',
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#047857' }}>Estimated Bill Sum</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Includes 2h minimum scheduling</span>
                  </div>
                  <strong style={{ fontSize: '20px', color: '#10b981' }}>${selectedWorker.hourlyRate * 2}</strong>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                  Proceed to Payment
                </button>
              </form>
            ) : (
              <form onSubmit={handlePayMongoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {paymentSuccess ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <CheckCircle size={44} color="#10b981" style={{ margin: '0 auto 12px auto', animation: 'logoBounce 1.5s infinite ease-in-out' }} />
                    <h3 style={{ color: '#047857' }}>Payment Securely Completed!</h3>
                    <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                      Routing to secure matching gateway...
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        background: '#f1f5f9',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>PayMongo Sandbox Invoice:</span>
                      <strong style={{ color: '#10b981', fontSize: '18px' }}>${selectedWorker.hourlyRate * 2}</strong>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Cardholder Name</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Card Number</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          maxLength={19}
                          className="form-input"
                          style={{ paddingLeft: '44px' }}
                          required
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                            setCardNumber(formatted);
                          }}
                        />
                        <CreditCard
                          size={18}
                          style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#10b981',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">Expiry Date</label>
                        <input
                          type="text"
                          maxLength={5}
                          className="form-input"
                          required
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length >= 2) {
                              setCardExpiry(`${val.slice(0, 2)}/${val.slice(2, 4)}`);
                            } else {
                              setCardExpiry(val);
                            }
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVC Code</label>
                        <input
                          type="password"
                          maxLength={3}
                          className="form-input"
                          required
                          placeholder="•••"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '12px' }}
                      disabled={processingPayment}
                    >
                      {processingPayment ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <RotateCw size={16} style={{ animation: 'rotateRing 1.5s linear infinite' }} />
                          Encrypting Transaction...
                        </span>
                      ) : (
                        `Authorize Payment ($${selectedWorker.hourlyRate * 2})`
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ width: '100%' }}
                      onClick={() => setPaymentStep(false)}
                      disabled={processingPayment}
                    >
                      Back to details
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        )}
      </ModalDrawer>

      {/* SERVICE REVIEW MODAL */}
      <ModalDrawer
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title="Rate & Review Professional"
      >
        <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: '#64748b', fontSize: '13px' }}>
            Your feedback helps us maintain a verified network of top-tier local service providers.
          </p>

          <div className="form-group" style={{ alignItems: 'center' }}>
            <label className="form-label">Select Stars Rating</label>
            <div style={{ display: 'flex', gap: '8px', margin: '8px 0' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={32}
                  fill={ratingInput >= star ? '#d97706' : 'none'}
                  color="#d97706"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setRatingInput(star)}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Written Feedback</label>
            <textarea
              className="form-input"
              rows={3}
              required
              style={{ resize: 'none' }}
              placeholder="Describe your experience with the professional (punctuality, service quality, expertise)..."
              value={reviewTextInput}
              onChange={(e) => setReviewTextInput(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={submittingReview}
          >
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </ModalDrawer>
    </div>
  );
};

export default ClientDashboard;
