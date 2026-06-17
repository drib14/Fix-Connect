import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWorkers, geocodeAddress } from '../services/userService';
import { createBooking, getBookings, getBookingById, updateBookingStatus, sendChatMessage, createReview } from '../services/bookingService';
import { createPaymentIntent, confirmPayment } from '../services/paymentService';
import { 
  Search, MapPin, Hammer, Star, Calendar, MessageSquare, 
  Clock, DollarSign, X, Check, ArrowLeft, LogOut, ChevronRight, User
} from 'lucide-react';

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Gardening', 'Repair'];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
];

const UserPortal = () => {
  const { user, onboard, logout, refreshUserData } = useAuth();
  const [view, setView] = useState('home'); // 'home', 'search', 'worker-detail', 'booking-detail', 'history', 'profile'
  
  // Onboarding States
  const [onboardAddress, setOnboardAddress] = useState('');
  const [onboardCoords, setOnboardCoords] = useState(null); // [lon, lat]
  const [onboardAvatar, setOnboardAvatar] = useState(AVATAR_PRESETS[0]);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [onboardLoading, setOnboardLoading] = useState(false);

  // Home/Search States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [workers, setWorkers] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [distanceFilter, setDistanceFilter] = useState(25); // km

  // Bookings States
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingFormData, setBookingFormData] = useState({
    description: '',
    date: '',
    time: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  // Chat & Review & Payment States
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('none'); // 'none', 'gateway'
  const [paymentMethod, setPaymentMethod] = useState('GCash'); // 'GCash', 'Maya', 'Card'
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const chatEndRef = useRef(null);

  // Fetch initial home details
  useEffect(() => {
    if (user && user.onboardingCompleted) {
      fetchBookings();
    }
  }, [user]);

  // Polling for booking details if viewed
  useEffect(() => {
    let interval;
    if (selectedBooking) {
      interval = setInterval(async () => {
        try {
          const updated = await getBookingById(selectedBooking._id);
          setSelectedBooking(updated);
        } catch (err) {
          console.error('Failed to poll booking details', err);
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [selectedBooking]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedBooking?.chat]);

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const list = await getBookings();
      setBookings(list);
    } catch (err) {
      console.error(err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleAddressSearch = async (val) => {
    setOnboardAddress(val);
    if (val.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setSuggestionLoading(true);
    try {
      const results = await geocodeAddress(val);
      setAddressSuggestions(results || []);
    } catch (err) {
      console.error('Geocoding search failed', err);
    } finally {
      setSuggestionLoading(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    setOnboardAddress(item.display_name);
    setOnboardCoords([item.lon, item.lat]);
    setAddressSuggestions([]);
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!onboardAddress || !onboardCoords) {
      alert('Please select a valid address from the search suggestions.');
      return;
    }

    setOnboardLoading(true);
    try {
      await onboard({
        address: onboardAddress,
        coordinates: onboardCoords,
        avatar: onboardAvatar,
      });
      refreshUserData();
    } catch (err) {
      alert(err);
    } finally {
      setOnboardLoading(false);
    }
  };

  const handleSearchWorkers = async (category = selectedCategory) => {
    setWorkersLoading(true);
    setView('search');
    try {
      const filters = {
        specialty: category,
        maxDistance: distanceFilter,
        search: searchQuery,
      };
      
      // Send user's coordinates for distance filtering if available
      if (user.coordinates && user.coordinates.length === 2) {
        filters.lon = user.coordinates[0];
        filters.lat = user.coordinates[1];
      }

      const list = await getWorkers(filters);
      setWorkers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setWorkersLoading(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!bookingFormData.description || !bookingFormData.date || !bookingFormData.time) {
      alert('Please fill out all booking details');
      return;
    }

    setBookingLoading(true);
    try {
      const scheduledAt = new Date(`${bookingFormData.date}T${bookingFormData.time}`);
      await createBooking({
        workerId: selectedWorker._id,
        serviceType: selectedWorker.specialty,
        description: bookingFormData.description,
        scheduledAt: scheduledAt.toISOString(),
        address: user.address,
        coordinates: user.coordinates,
      });
      setBookingFormData({ description: '', date: '', time: '' });
      setSelectedWorker(null);
      await fetchBookings();
      setView('home');
    } catch (err) {
      alert(err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await updateBookingStatus(id, 'CANCELLED');
      const updated = await getBookingById(id);
      setSelectedBooking(updated);
      fetchBookings();
    } catch (err) {
      alert(err);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setChatLoading(true);
    try {
      const chat = await sendChatMessage(selectedBooking._id, chatMessage);
      setSelectedBooking({
        ...selectedBooking,
        chat,
      });
      setChatMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const handlePaymongoCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const intent = await createPaymentIntent(selectedBooking._id);
      setPaymentStep('gateway');
    } catch (err) {
      alert(err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleConfirmMockPayment = async (e) => {
    e.preventDefault();
    setCheckoutLoading(true);
    try {
      const payload = {
        bookingId: selectedBooking._id,
        paymentMethod: paymentMethod,
        paymentId: `pm_sess_${Math.random().toString(36).substr(2, 9)}`,
      };
      await confirmPayment(payload.bookingId, payload.paymentMethod, payload.paymentId);
      const updated = await getBookingById(selectedBooking._id);
      setSelectedBooking(updated);
      setPaymentStep('none');
      fetchBookings();
    } catch (err) {
      alert(err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      await createReview(selectedBooking._id, reviewRating, reviewComment);
      const updated = await getBookingById(selectedBooking._id);
      setSelectedBooking(updated);
      setReviewComment('');
      fetchBookings();
    } catch (err) {
      alert(err);
    } finally {
      setReviewLoading(false);
    }
  };

  // ------------------------------------------
  // RENDER ONBOARDING
  // ------------------------------------------
  if (!user.onboardingCompleted) {
    return (
      <div className="p-6 flex flex-col h-full bg-slate-50 justify-center">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Complete Profile</h2>
          <p className="text-sm text-slate-500 mt-1">Please enter your service details to continue</p>
        </div>

        <form onSubmit={handleOnboardSubmit} className="space-y-5">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Select Avatar
            </label>
            <div className="flex justify-center space-x-3">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setOnboardAvatar(preset)}
                  className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                    onboardAvatar === preset ? 'border-primary-500 scale-105 shadow-md' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={preset} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* LocationIQ Address Search */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Home Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={onboardAddress}
                onChange={(e) => handleAddressSearch(e.target.value)}
                className="input-field pl-10 text-sm py-2.5 bg-white border-slate-200"
                placeholder="Start typing your city/street..."
                required
              />
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              {suggestionLoading && (
                <span className="absolute right-3 top-3 text-xs text-slate-400">Searching...</span>
              )}
            </div>

            {addressSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 shadow-xl rounded-xl max-h-48 overflow-y-auto z-50">
                {addressSuggestions.map((item, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs text-slate-700 border-b border-slate-50 last:border-0 truncate block"
                  >
                    {item.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={onboardLoading}
            className="btn-primary w-full py-2.5 text-sm cursor-pointer mt-4"
          >
            {onboardLoading ? 'Saving...' : 'Finish Onboarding'}
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full py-2 text-center text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
          >
            Cancel and Log Out
          </button>
        </form>
      </div>
    );
  }

  // ------------------------------------------
  // RENDER APP CORE VIEWS
  // ------------------------------------------
  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      
      {/* Header bar */}
      <div className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-30 shadow-xs">
        {view !== 'home' ? (
          <button 
            onClick={() => {
              if (view === 'gateway') setView('booking-detail');
              else if (view === 'worker-detail') setView('search');
              else setView('home');
            }} 
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <img 
              src={user.avatar || AVATAR_PRESETS[0]} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full object-cover border border-slate-100" 
            />
            <div className="text-left leading-none">
              <div className="text-xs text-slate-400">Welcome,</div>
              <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{user.fullName}</div>
            </div>
          </div>
        )}
        <div className="text-xs font-bold text-slate-700 font-display">
          {view === 'home' && 'Fix-Connect Client'}
          {view === 'search' && 'Find Workers'}
          {view === 'worker-detail' && 'Book Worker'}
          {view === 'booking-detail' && 'Job Booking'}
          {view === 'profile' && 'My Profile'}
        </div>
        <button 
          onClick={logout} 
          className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 cursor-pointer" 
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Main viewport */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        
        {/* VIEW: HOME */}
        {view === 'home' && (
          <div className="space-y-6 animate-fade-in text-left">
            {/* Search Header Banner */}
            <div className="bg-gradient-to-tr from-primary-600 to-primary-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              <h3 className="text-lg font-bold font-display leading-snug">Need a local handyman?</h3>
              <p className="text-white/80 text-xs mt-1 mb-4">Book verified local professionals in minutes</p>
              
              {/* Category Quick Link Grid */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search plumbers, electricians..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchWorkers('All')}
                  className="w-full pl-9 pr-8 py-2 bg-white/15 backdrop-blur-md rounded-xl text-xs text-white placeholder-white/60 focus:bg-white focus:text-slate-800 focus:placeholder-slate-400 outline-none border border-white/10 transition-all"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/70 pointer-events-none" />
                <button 
                  onClick={() => handleSearchWorkers('All')}
                  className="absolute right-2.5 top-2 text-[10px] bg-white text-primary-600 hover:bg-slate-50 font-bold px-2 py-0.5 rounded-lg cursor-pointer"
                >
                  Go
                </button>
              </div>
            </div>

            {/* Specialties Section */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Service Categories</h4>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      handleSearchWorkers(cat);
                    }}
                    className="flex flex-col items-center p-3 bg-white hover:bg-slate-100 rounded-xl border border-slate-100 shadow-xs transition cursor-pointer"
                  >
                    <div className="w-9 h-9 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-1.5">
                      <Hammer className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Bookings Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Bookings</h4>
                <button 
                  onClick={fetchBookings} 
                  className="text-[10px] text-primary-600 hover:underline font-bold cursor-pointer"
                >
                  Refresh
                </button>
              </div>

              {bookingsLoading ? (
                <div className="text-center py-6 text-xs text-slate-400">Loading bookings...</div>
              ) : bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && b.status !== 'DECLINED').length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                  No active requests. Select a service category above to book!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {bookings
                    .filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && b.status !== 'DECLINED')
                    .map((b) => (
                      <div
                        key={b._id}
                        onClick={() => {
                          setSelectedBooking(b);
                          setView('booking-detail');
                        }}
                        className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs hover:border-slate-200 cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <img 
                            src={b.workerId?.avatar || AVATAR_PRESETS[0]} 
                            alt="worker" 
                            className="w-10 h-10 rounded-full object-cover border border-slate-50" 
                          />
                          <div className="text-left">
                            <h5 className="text-xs font-bold text-slate-800 leading-tight">
                              {b.workerId?.fullName}
                            </h5>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {b.serviceType} &bull; {new Date(b.scheduledAt).toLocaleDateString()}
                            </span>
                            <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-1 leading-none ${
                              b.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              b.status === 'ACCEPTED' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              b.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {b.status}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: SEARCH WORKERS */}
        {view === 'search' && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setView('home')} 
                className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-bold text-slate-800">
                {selectedCategory} Workers
              </h3>
            </div>

            {/* Filter Panel */}
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Max Distance: {distanceFilter} km
                </span>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={distanceFilter}
                  onChange={(e) => {
                    setDistanceFilter(parseInt(e.target.value));
                  }}
                  onMouseUp={() => handleSearchWorkers()}
                  onTouchEnd={() => handleSearchWorkers()}
                  className="w-24 accent-primary-600"
                />
              </div>
            </div>

            {workersLoading ? (
              <div className="text-center py-12 text-xs text-slate-400">Searching providers...</div>
            ) : workers.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-xl p-8 text-center text-xs text-slate-400">
                No active workers found in this category within {distanceFilter}km.
              </div>
            ) : (
              <div className="space-y-2.5">
                {workers.map((w) => (
                  <div
                    key={w.id || w._id}
                    onClick={() => {
                      setSelectedWorker(w);
                      setView('worker-detail');
                    }}
                    className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs flex hover:border-primary-200 transition-all cursor-pointer text-left"
                  >
                    <img
                      src={w.avatar || AVATAR_PRESETS[0]}
                      alt={w.fullName}
                      className="w-16 h-16 rounded-xl object-cover mr-3 border border-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-800 truncate leading-none">
                          {w.fullName}
                        </h4>
                        <span className="text-xs font-bold text-primary-600 leading-none">
                          PHP {w.hourlyRate}/hr
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{w.specialty} &bull; {w.experienceYears}y exp</p>
                      
                      {w.distance !== null && (
                        <p className="text-[9px] text-slate-500 mt-0.5 flex items-center">
                          <MapPin className="w-2.5 h-2.5 text-slate-400 mr-1" />
                          {w.distance} km away
                        </p>
                      )}

                      <div className="flex items-center mt-2 space-x-3">
                        <span className="flex items-center text-[10px] font-bold text-amber-500 leading-none">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                          {w.rating.toFixed(1)}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          ({w.ratingsCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: WORKER DETAILS & BOOK FORM */}
        {view === 'worker-detail' && selectedWorker && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setView('search')} 
                className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-bold text-slate-800">Worker Profile</h3>
            </div>

            {/* Profile Overview */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs text-center flex flex-col items-center">
              <img
                src={selectedWorker.avatar || AVATAR_PRESETS[0]}
                alt={selectedWorker.fullName}
                className="w-20 h-20 rounded-full object-cover shadow-sm border-2 border-slate-50 mb-2"
              />
              <h4 className="text-sm font-bold text-slate-800 leading-tight">{selectedWorker.fullName}</h4>
              <p className="text-xs text-primary-600 font-bold mt-1">{selectedWorker.specialty} Specialist</p>
              
              <div className="flex items-center mt-1.5 space-x-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-amber-600">{selectedWorker.rating.toFixed(1)}</span>
                <span className="text-xs text-slate-400">({selectedWorker.ratingsCount} ratings)</span>
              </div>

              <p className="text-xs text-slate-500 mt-3 italic max-w-xs px-2">
                "{selectedWorker.bio || 'Professional handyman service available for local assistance.'}"
              </p>
            </div>

            {/* Booking Request Form */}
            <form onSubmit={handleCreateBooking} className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs space-y-3.5">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Book a Job</h4>
              
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Describe the job/issue
                </label>
                <textarea
                  value={bookingFormData.description}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, description: e.target.value })}
                  placeholder="Tell the worker what needs fixing..."
                  className="input-field text-xs min-h-20 bg-slate-50 border-slate-200"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                    Schedule Date
                  </label>
                  <input
                    type="date"
                    value={bookingFormData.date}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, date: e.target.value })}
                    className="input-field text-xs py-2 bg-slate-50 border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                    Schedule Time
                  </label>
                  <input
                    type="time"
                    value={bookingFormData.time}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, time: e.target.value })}
                    className="input-field text-xs py-2 bg-slate-50 border-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Estimated Rate:</span>
                <span className="font-bold text-slate-800">PHP {selectedWorker.hourlyRate}/hr</span>
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="btn-primary w-full py-2.5 text-xs font-bold cursor-pointer"
              >
                {bookingLoading ? 'Requesting...' : 'Request Booking'}
              </button>
            </form>
          </div>
        )}

        {/* VIEW: BOOKING DETAIL & CHAT */}
        {view === 'booking-detail' && selectedBooking && (
          <div className="space-y-4 animate-fade-in text-left pb-4">
            
            {/* Paymongo Simulated Portal Overlay */}
            {paymentStep === 'gateway' && (
              <div className="absolute inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 border border-slate-100 relative text-left animate-slide-up">
                  <button 
                    onClick={() => setPaymentStep('none')}
                    className="absolute right-4 top-4 p-1 hover:bg-slate-100 rounded text-slate-400 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="text-center mb-5">
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Paymongo Sandbox
                    </span>
                    <h4 className="text-lg font-extrabold text-slate-800 mt-2">
                      Secure Checkout
                    </h4>
                    <p className="text-xl font-black text-primary-600 mt-1">
                      PHP {selectedBooking.price.toFixed(2)}
                    </p>
                  </div>

                  <form onSubmit={handleConfirmMockPayment} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['GCash', 'Maya', 'Card'].map((method) => (
                          <button
                            type="button"
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={`py-2 rounded-xl text-xs font-bold border transition ${
                              paymentMethod === method
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-slate-200 bg-slate-50 text-slate-500'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    {paymentMethod === 'Card' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Card Number"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="input-field py-2 text-xs bg-slate-50 border-slate-200"
                          required
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="input-field py-2 text-xs bg-slate-50 border-slate-200"
                            required
                          />
                          <input
                            type="text"
                            placeholder="CVC"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="input-field py-2 text-xs bg-slate-50 border-slate-200"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod !== 'Card' && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] text-slate-500">
                        You will be redirected to the test sandbox for <b>{paymentMethod}</b>. Simply click below to finalize payment.
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={checkoutLoading}
                      className="btn-primary w-full py-2.5 text-xs font-bold cursor-pointer"
                    >
                      {checkoutLoading ? 'Processing...' : `Confirm Payment & Pay`}
                    </button>
                  </form>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setView('home')} 
                className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-bold text-slate-800">Job Booking Details</h3>
            </div>

            {/* Provider card */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedBooking.workerId?.avatar || AVATAR_PRESETS[0]}
                  alt="worker"
                  className="w-12 h-12 rounded-full object-cover border border-slate-100"
                />
                <div className="text-left">
                  <h4 className="text-xs font-bold text-slate-800">{selectedBooking.workerId?.fullName}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedBooking.serviceType} Specialist</p>
                  <span className="text-[9px] font-bold text-slate-500">Rate: PHP {selectedBooking.workerId?.hourlyRate}/hr</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-md leading-none ${
                  selectedBooking.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                  selectedBooking.status === 'ACCEPTED' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                  selectedBooking.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                  selectedBooking.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {selectedBooking.status}
                </span>
                <p className="text-[10px] font-black text-slate-800 mt-1.5">PHP {selectedBooking.price}</p>
              </div>
            </div>

            {/* Description & Address */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs space-y-2.5 text-xs text-left">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Job Description</span>
                <p className="text-slate-700 font-medium">{selectedBooking.description}</p>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Scheduled At</span>
                <p className="text-slate-700 font-semibold flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  {new Date(selectedBooking.scheduledAt).toLocaleString()}
                </p>
              </div>
              {selectedBooking.completedAt && (
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Completed At</span>
                  <p className="text-slate-700 font-semibold flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {new Date(selectedBooking.completedAt).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedBooking.paymentStatus && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[10px]">
                  <span className="font-bold text-slate-400 uppercase tracking-wide">Payment Status:</span>
                  <span className={`font-extrabold px-1.5 py-0.5 rounded ${
                    selectedBooking.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                    {selectedBooking.paymentStatus}
                  </span>
                </div>
              )}
            </div>

            {/* INVOICE & PAYMONGO TRIGGER BUTTONS */}
            {selectedBooking.status === 'COMPLETED' && selectedBooking.paymentStatus === 'UNPAID' && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm space-y-2.5 text-left">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Invoice Ready</h4>
                <p className="text-xs text-amber-700">The service provider has completed the work. Please process payment using Paymongo sandbox.</p>
                <button
                  onClick={handlePaymongoCheckout}
                  disabled={checkoutLoading}
                  className="btn-primary w-full py-2 bg-amber-600 hover:bg-amber-700 text-xs font-bold cursor-pointer"
                >
                  Pay PHP {selectedBooking.price}
                </button>
              </div>
            )}

            {/* LIVE CHAT DRAWER */}
            {(selectedBooking.status === 'ACCEPTED' || selectedBooking.status === 'IN_PROGRESS') && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-2xs overflow-hidden flex flex-col h-64">
                <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-600 flex items-center">
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-primary-500 animate-pulse" />
                    Live Coordination Chat
                  </span>
                </div>
                
                {/* Chat Log */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 select-none">
                  {selectedBooking.chat && selectedBooking.chat.length === 0 ? (
                    <div className="text-center text-[10px] text-slate-400 py-12">No messages. Type a message below to coordinate details.</div>
                  ) : (
                    selectedBooking.chat?.map((msg, index) => {
                      const isMe = msg.senderId === user.id || msg.senderId === user._id;
                      return (
                        <div
                          key={index}
                          className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                        >
                          <div className={`p-2 rounded-xl text-xs ${
                            isMe ? 'bg-primary-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-[8px] text-slate-400 mt-0.5 px-0.5">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendChat} className="p-2 border-t border-slate-100 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-100 rounded-lg outline-none focus:bg-white focus:border-slate-200"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading}
                    className="px-3 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 cursor-pointer"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}

            {/* REVIEW / RATING SCREEN */}
            {selectedBooking.status === 'COMPLETED' && selectedBooking.paymentStatus === 'PAID' && (
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs space-y-3 text-left">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rate Provider</h4>
                {selectedBooking.review && selectedBooking.review.rating ? (
                  <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 text-xs">
                    <div className="flex items-center text-amber-500 mb-1">
                      {[...Array(selectedBooking.review.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-600 font-medium">"{selectedBooking.review.comment}"</p>
                    <span className="text-[9px] text-slate-400 block mt-2">Submitted on {new Date(selectedBooking.review.createdAt).toLocaleDateString()}</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">
                        Stars
                      </label>
                      <div className="flex space-x-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="p-1 cursor-pointer"
                          >
                            <Star className={`w-6 h-6 ${
                              reviewRating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">
                        Review Comment
                      </label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience working with this professional..."
                        className="input-field text-xs min-h-16 bg-slate-50 border-slate-200"
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={reviewLoading}
                      className="btn-primary w-full py-2 text-xs font-bold cursor-pointer"
                    >
                      {reviewLoading ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Cancel booking option */}
            {selectedBooking.status === 'PENDING' && (
              <button
                onClick={() => handleCancelBooking(selectedBooking._id)}
                className="w-full bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 font-bold text-xs py-2.5 rounded-xl cursor-pointer text-center"
              >
                Cancel Booking Request
              </button>
            )}
          </div>
        )}

        {/* VIEW: HISTORY (PAST JOBS) */}
        {view === 'history' && (
          <div className="space-y-3 animate-fade-in text-left">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Past Bookings</h3>
            {bookingsLoading ? (
              <div className="text-center py-6 text-xs text-slate-400">Loading history...</div>
            ) : bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED' || b.status === 'DECLINED').length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-xl p-8 text-center text-xs text-slate-400">
                No past transactions found.
              </div>
            ) : (
              <div className="space-y-2.5">
                {bookings
                  .filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED' || b.status === 'DECLINED')
                  .map((b) => (
                    <div
                      key={b._id}
                      onClick={() => {
                        setSelectedBooking(b);
                        setView('booking-detail');
                      }}
                      className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs hover:border-slate-200 cursor-pointer flex items-center justify-between"
                    >
                      <div className="text-left">
                        <h5 className="text-xs font-bold text-slate-800">{b.workerId?.fullName || 'Worker'}</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">{b.serviceType} &bull; {new Date(b.scheduledAt).toLocaleDateString()}</p>
                        <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded mt-1.5 leading-none ${
                          b.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-700">PHP {b.price}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 mt-1 inline-block" />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: USER PROFILE */}
        {view === 'profile' && (
          <div className="space-y-4 animate-fade-in text-left">
            <h3 className="text-sm font-bold text-slate-800 mb-4">My Account</h3>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs text-center flex flex-col items-center">
              <img
                src={user.avatar || AVATAR_PRESETS[0]}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 shadow-sm mb-2"
              />
              <h4 className="text-sm font-bold text-slate-800">{user.fullName}</h4>
              <p className="text-xs text-slate-400">{user.email}</p>
              <p className="text-[10px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full mt-2 uppercase">
                {user.role} Account
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs space-y-3 text-xs">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Phone Number</span>
                <span className="font-semibold text-slate-800">{user.phoneNumber}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Home Address</span>
                <span className="font-semibold text-slate-800">{user.address}</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 font-bold text-xs py-2.5 rounded-xl cursor-pointer flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        )}

      </div>

      {/* Navigation Footer */}
      <div className="h-14 bg-white border-t border-slate-100 flex items-center justify-around px-2 absolute bottom-0 left-0 right-0 z-30 select-none shadow-sm">
        <button
          onClick={() => setView('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            view === 'home' || view === 'search' || view === 'worker-detail' || view === 'booking-detail' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Hammer className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold">Services</span>
        </button>
        <button
          onClick={() => setView('history')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            view === 'history' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold">Bookings</span>
        </button>
        <button
          onClick={() => setView('profile')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            view === 'profile' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold">Profile</span>
        </button>
      </div>

    </div>
  );
};

export default UserPortal;
