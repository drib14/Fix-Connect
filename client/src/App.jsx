import { useState, useEffect, useRef } from 'react';
import { 
  Mail, Lock, User as UserIcon, Phone, ArrowRight, LogOut, 
  MapPin, Search, Calendar, Clock, DollarSign, Briefcase, 
  Star, ShieldAlert, Sparkles, CheckCircle, Trash2, X, PlusCircle,
  CreditCard, Wallet, Navigation
} from 'lucide-react';
import logo from './assets/logo.png';

// API request helper
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiCall = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'API Error');
  }

  return result;
};

// LocationIQ Search Helper
const searchLocation = async (query) => {
  const token = import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN;
  if (!token) return [];
  try {
    const res = await fetch(`https://us1.locationiq.com/v1/search.php?key=${token}&q=${encodeURIComponent(query)}&format=json&countrycodes=ph`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('LocationIQ search error:', err);
    return [];
  }
};

// LocationIQ Reverse Geocode Helper
const reverseGeocode = async (lat, lon) => {
  const token = import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN;
  if (!token) return 'Unknown Location';
  try {
    const res = await fetch(`https://us1.locationiq.com/v1/reverse.php?key=${token}&lat=${lat}&lon=${lon}&format=json`);
    if (!res.ok) return 'Unknown Location';
    const data = await res.json();
    return data.display_name || 'Selected coordinates';
  } catch (err) {
    console.error('LocationIQ reverse geocode error:', err);
    return 'Selected coordinates';
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('home'); // home, bookings, profile (worker only)
  
  // Auth states
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', role: 'USER' });
  const [authError, setAuthError] = useState('');

  // Customer view states
  const [workers, setWorkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userLocation, setUserLocation] = useState({ name: 'Manila, Philippines', lng: 120.9842, lat: 14.5995 });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [loadingWorkers, setLoadingWorkers] = useState(false);

  // Worker view states
  const [workerProfile, setWorkerProfile] = useState(null);
  const [workerServices, setWorkerServices] = useState([]);
  const [profileForm, setProfileForm] = useState({ skills: '', category: 'Cleaning', description: '', hourlyRate: '50', locationName: '', longitude: '', latitude: '', avatar: '' });
  const [newServiceForm, setNewServiceForm] = useState({ name: '', category: 'Cleaning', description: '', price: '100', duration: '1 hour' });
  const [editingProfile, setEditingProfile] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Modals / Flow states
  const [bookingWorker, setBookingWorker] = useState(null); // Worker object selected for booking
  const [bookingForm, setBookingForm] = useState({ date: '', time: '', description: '', address: '', longitude: '', latitude: '' });
  const [bookingAddressSuggestions, setBookingAddressSuggestions] = useState([]);
  const [showBookingAddressDropdown, setShowBookingAddressDropdown] = useState(false);
  
  // Payment states
  const [checkoutBooking, setCheckoutBooking] = useState(null); // Booking object selected for checkout
  const [paymentMethod, setPaymentMethod] = useState('gcash'); // gcash, paymaya, card
  const [cardForm, setCardForm] = useState({ cardNumber: '', expMonth: '', expYear: '', cvc: '' });
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Fetch current user details on start
  useEffect(() => {
    if (token) {
      apiCall('/auth/me')
        .then((res) => {
          setUser(res.user);
          if (res.user.role === 'WORKER') {
            fetchWorkerProfile();
          } else {
            fetchWorkers();
          }
          fetchBookings();
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, [token]);

  // Search workers whenever query or category changes
  useEffect(() => {
    if (user && user.role === 'USER') {
      fetchWorkers();
    }
  }, [selectedCategory, userLocation]);

  const fetchWorkers = async () => {
    setLoadingWorkers(true);
    try {
      let endpoint = `/workers/search?category=${selectedCategory}`;
      if (searchQuery) {
        endpoint += `&query=${encodeURIComponent(searchQuery)}`;
      }
      if (userLocation.lng && userLocation.lat) {
        endpoint += `&lng=${userLocation.lng}&lat=${userLocation.lat}`;
      }
      const data = await apiCall(endpoint);
      setWorkers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWorkers(false);
    }
  };

  const fetchWorkerProfile = async () => {
    try {
      const data = await apiCall('/workers/profile/me');
      setWorkerProfile(data.profile);
      setWorkerServices(data.services);
      if (data.profile) {
        setProfileForm({
          skills: data.profile.skills.join(', '),
          category: data.profile.category,
          description: data.profile.description,
          hourlyRate: data.profile.hourlyRate.toString(),
          locationName: data.profile.locationName,
          longitude: data.profile.coordinates.coordinates[0],
          latitude: data.profile.coordinates.coordinates[1],
          avatar: data.profile.avatar,
        });
      }
    } catch (err) {
      console.error('No worker profile exists yet.');
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await apiCall('/bookings');
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLogin) {
        const res = await apiCall('/auth/login', 'POST', {
          email: authForm.email,
          password: authForm.password,
        });
        localStorage.setItem('token', res.accessToken);
        setToken(res.accessToken);
        setUser(res.user);
      } else {
        const res = await apiCall('/auth/register', 'POST', authForm);
        localStorage.setItem('token', res.accessToken);
        setToken(res.accessToken);
        setUser(res.user);
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setWorkers([]);
    setBookings([]);
    setActiveTab('home');
  };

  // Location suggestions search
  const handleLocationSearch = async (val) => {
    if (!val) {
      setLocationSuggestions([]);
      return;
    }
    const results = await searchLocation(val);
    setLocationSuggestions(results);
    setShowLocationDropdown(true);
  };

  const handleSelectLocation = (loc) => {
    setUserLocation({
      name: loc.display_name.split(',')[0] + ', ' + loc.display_name.split(',')[1],
      lng: parseFloat(loc.lon),
      lat: parseFloat(loc.lat)
    });
    setShowLocationDropdown(false);
    setLocationSuggestions([]);
  };

  // Find workers near user's GPS
  const handleUseGPSLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const name = await reverseGeocode(latitude, longitude);
      setUserLocation({
        name: name.split(',')[0] + ', ' + name.split(',')[1],
        lng: longitude,
        lat: latitude
      });
    });
  };

  // Booking details location suggestions
  const handleBookingLocationSearch = async (val) => {
    setBookingForm({ ...bookingForm, address: val });
    if (!val) {
      setBookingAddressSuggestions([]);
      return;
    }
    const results = await searchLocation(val);
    setBookingAddressSuggestions(results);
    setShowBookingAddressDropdown(true);
  };

  const handleSelectBookingLocation = (loc) => {
    setBookingForm({
      ...bookingForm,
      address: loc.display_name,
      longitude: parseFloat(loc.lon),
      latitude: parseFloat(loc.lat)
    });
    setShowBookingAddressDropdown(false);
    setBookingAddressSuggestions([]);
  };

  // Save/Update Worker Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = profileForm.skills.split(',').map(s => s.trim()).filter(Boolean);
      await apiCall('/workers/profile', 'PUT', {
        ...profileForm,
        skills: skillsArray,
      });
      setEditingProfile(false);
      fetchWorkerProfile();
    } catch (err) {
      console.error(err);
    }
  };

  // Profile Avatar Base64 Upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const uploadRes = await apiCall('/workers/upload', 'POST', { image: reader.result });
        setProfileForm({ ...profileForm, avatar: uploadRes.url });
      } catch (err) {
        console.error('Upload failed:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Worker custom service
  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await apiCall('/workers/services', 'POST', newServiceForm);
      setNewServiceForm({ name: '', category: 'Cleaning', description: '', price: '100', duration: '1 hour' });
      fetchWorkerProfile();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete worker service
  const handleDeleteService = async (id) => {
    try {
      await apiCall(`/workers/services/${id}`, 'DELETE');
      fetchWorkerProfile();
    } catch (err) {
      console.error(err);
    }
  };

  // Create Booking
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      const bookingData = {
        workerId: bookingWorker.userId._id,
        bookingDate: bookingForm.date,
        bookingTime: bookingForm.time,
        description: bookingForm.description,
        address: bookingForm.address,
        longitude: bookingForm.longitude,
        latitude: bookingForm.latitude,
        amount: bookingWorker.hourlyRate * 3, // Initial estimate is 3 hours
      };
      
      const newBooking = await apiCall('/bookings', 'POST', bookingData);
      setBookingWorker(null);
      setBookingForm({ date: '', time: '', description: '', address: '', longitude: '', latitude: '' });
      fetchBookings();
      
      // Auto trigger Checkout Modal
      setCheckoutBooking(newBooking);
    } catch (err) {
      alert(err.message);
    }
  };

  // Paymongo Payment Attach flow
  const handlePaymongoPayment = async (e) => {
    e.preventDefault();
    setPaying(true);
    setPaymentError('');

    try {
      const payload = {
        bookingId: checkoutBooking._id,
        paymentMethodType: paymentMethod,
      };

      if (paymentMethod === 'card') {
        payload.cardDetails = cardForm;
      }

      const res = await apiCall('/payments/create-payment', 'POST', payload);

      if (res.status === 'succeeded') {
        alert('Payment completed successfully!');
        setCheckoutBooking(null);
        fetchBookings();
      } else if (res.redirectUrl) {
        // Redirect user to e-wallet authorize screen (GCash / PayMaya)
        window.location.href = res.redirectUrl;
      } else {
        setPaymentError('Payment requires additional validation');
      }
    } catch (err) {
      setPaymentError(err.message);
    } finally {
      setPaying(false);
    }
  };

  // Booking status changes
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await apiCall(`/bookings/${bookingId}/status`, 'PATCH', { status: newStatus });
      fetchBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center border border-primary-200 overflow-hidden">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">Fix-Connect</span>
          </div>

          {user && (
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-2">
                <button 
                  onClick={() => setActiveTab('home')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'home' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab('bookings')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'bookings' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  My Bookings
                </button>
                {user.role === 'WORKER' && (
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Service Profile
                  </button>
                )}
              </nav>

              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800">{user.fullName}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 capitalize">
                    {user.role.toLowerCase()}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Unauthenticated View */}
        {!user && (
          <div className="max-w-md mx-auto my-12 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-xl mb-4 border border-primary-100 overflow-hidden">
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">Fix-Connect</h2>
              <p className="text-slate-500 mt-2">Connecting premium home service workers locally</p>
            </div>

            <div className="glass-card p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-center text-slate-800">
                {isLogin ? 'Sign in to your account' : 'Create a new account'}
              </h3>

              {authError && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        className="input-field pl-11"
                        placeholder="Full Name"
                        value={authForm.fullName}
                        onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        className="input-field pl-11"
                        placeholder="Phone Number (e.g. 09171234567)"
                        value={authForm.phoneNumber}
                        onChange={(e) => setAuthForm({ ...authForm, phoneNumber: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="input-field pl-11"
                    placeholder="Email address"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="input-field pl-11"
                    placeholder="Password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  />
                </div>

                {!isLogin && (
                  <div className="flex gap-4 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authForm.role === 'USER' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                      onClick={() => setAuthForm({ ...authForm, role: 'USER' })}
                    >
                      Book services
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authForm.role === 'WORKER' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                      onClick={() => setAuthForm({ ...authForm, role: 'WORKER' })}
                    >
                      Provide services
                    </button>
                  </div>
                )}

                <button type="submit" className="btn-primary group flex items-center justify-center gap-2 mt-2">
                  <span>{isLogin ? 'Sign in' : 'Sign up'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-semibold text-accent-600 hover:text-accent-500 hover:underline transition-all"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* User / Customer Dashboard */}
        {user && user.role === 'USER' && activeTab === 'home' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Search and location banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-500 p-8 sm:p-12 text-white shadow-xl shadow-emerald-500/10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)]"></div>
              <div className="relative max-w-2xl space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Book local professionals
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">Find trusted workers near you instantly.</h1>
                <p className="text-emerald-50 opacity-90">Enter your address to search workers organized by physical proximity.</p>
                
                {/* Search Bars */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  
                  {/* Location Autocomplete */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-md"
                      placeholder="Enter location / street address..."
                      value={userLocation.name}
                      onChange={(e) => handleLocationSearch(e.target.value)}
                      onFocus={() => setShowLocationDropdown(true)}
                    />
                    <button 
                      onClick={handleUseGPSLocation}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600"
                      title="Use current location"
                    >
                      <Navigation className="w-5 h-5" />
                    </button>

                    {/* Autocomplete Dropdown */}
                    {showLocationDropdown && locationSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 text-slate-800 divide-y divide-slate-50 overflow-hidden max-h-60 overflow-y-auto">
                        {locationSuggestions.map((loc, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectLocation(loc)}
                            className="w-full px-4 py-3 text-left hover:bg-slate-50 text-sm flex items-start gap-2 transition-all"
                          >
                            <MapPin className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                            <span>{loc.display_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Query Search */}
                  <div className="relative sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-md"
                      placeholder="Plumber, cleaner..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchWorkers()}
                    />
                  </div>

                  <button 
                    onClick={fetchWorkers}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-slate-800 active:scale-95 transition-all shadow-lg"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Categories filter */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-800">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {['All', 'Cleaning', 'Plumbing', 'Electrical', 'Carpentry', 'Handyman', 'Painting', 'Gardening'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4.5 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-sm ${selectedCategory === cat ? 'bg-primary-600 text-white shadow-primary-500/20' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Workers grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Available Workers Nearby</h2>
                <span className="text-sm text-slate-500 font-medium">Sorting by proximity distance</span>
              </div>

              {loadingWorkers ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
                  ))}
                </div>
              ) : workers.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl space-y-3">
                  <Star className="w-12 h-12 mx-auto text-slate-300" />
                  <h3 className="text-lg font-bold text-slate-700">No workers found</h3>
                  <p className="text-slate-400">Try expanding your search query or choosing another category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workers.map((worker) => (
                    <div key={worker._id} className="glass-card overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-slate-100">
                      <div className="p-6 flex-1 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                            {worker.avatar ? (
                              <img src={worker.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl">
                                {worker.userId.fullName[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-800">{worker.userId.fullName}</h3>
                            <span className="inline-block text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100/50">
                              {worker.category}
                            </span>
                            <div className="flex items-center gap-1 mt-1 text-amber-500">
                              <Star className="w-4 h-4 fill-amber-500" />
                              <span className="text-xs font-bold">{worker.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-slate-500 line-clamp-3">{worker.description || 'No description provided.'}</p>

                        <div className="flex flex-wrap gap-1">
                          {worker.skills.map((skill, idx) => (
                            <span key={idx} className="text-xs px-2.5 py-1 bg-slate-50 text-slate-600 rounded-xl font-medium border border-slate-100">
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-sm">
                          <span className="text-slate-400 flex items-center gap-1">
                            <MapPin className="w-4 h-4 flex-shrink-0" /> {worker.locationName.split(',')[0]}
                          </span>
                          <span className="font-extrabold text-slate-800">
                            ₱{worker.hourlyRate.toFixed(2)}<span className="text-xs text-slate-400 font-normal">/hr</span>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setBookingWorker(worker);
                          setBookingForm({ ...bookingForm, address: userLocation.name, longitude: userLocation.lng, latitude: userLocation.lat });
                        }}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all text-center flex items-center justify-center gap-1.5"
                      >
                        Book Worker
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Worker Profiles & Services Panel */}
        {user && user.role === 'WORKER' && activeTab === 'profile' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 font-display">Service Profile</h1>
                <p className="text-sm text-slate-500">Manage your skills, categories, description, location, and rates</p>
              </div>
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="px-4.5 py-2 border border-slate-200 bg-white rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
              >
                {editingProfile ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {editingProfile ? (
              <form onSubmit={handleSaveProfile} className="glass-card p-6 sm:p-8 space-y-6 shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Profile photo */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">Profile Picture</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                        {profileForm.avatar ? (
                          <img src={profileForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Service Category</label>
                    <select
                      className="input-field"
                      value={profileForm.category}
                      onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                    >
                      {['Cleaning', 'Plumbing', 'Electrical', 'Carpentry', 'Handyman', 'Painting', 'Gardening', 'Other'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Hourly Rate (₱)</label>
                    <input
                      type="number"
                      required
                      className="input-field"
                      placeholder="e.g. 150"
                      value={profileForm.hourlyRate}
                      onChange={(e) => setProfileForm({ ...profileForm, hourlyRate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Skills (comma separated)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. pipe fixing, leak repair, welding"
                      value={profileForm.skills}
                      onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700">Location / Service Address</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      placeholder="Type location to autocomplete..."
                      value={profileForm.locationName}
                      onChange={async (e) => {
                        setProfileForm({ ...profileForm, locationName: e.target.value });
                        const res = await searchLocation(e.target.value);
                        if (res.length > 0) {
                          setProfileForm(prev => ({
                            ...prev,
                            locationName: e.target.value,
                            longitude: parseFloat(res[0].lon),
                            latitude: parseFloat(res[0].lat)
                          }));
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700">Service Description</label>
                    <textarea
                      rows="4"
                      className="input-field"
                      placeholder="Introduce yourself and your experience..."
                      value={profileForm.description}
                      onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                    />
                  </div>

                </div>

                <button type="submit" className="btn-primary w-auto px-6">
                  Save Changes
                </button>
              </form>
            ) : workerProfile ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Profile detail card */}
                <div className="lg:col-span-1 glass-card p-6 space-y-6 shadow-sm border border-slate-100">
                  <div className="text-center space-y-3">
                    <div className="w-24 h-24 rounded-3xl bg-slate-100 border border-slate-200 overflow-hidden mx-auto flex items-center justify-center">
                      {workerProfile.avatar ? (
                        <img src={workerProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-12 h-12 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">{user.fullName}</h2>
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100/50">
                        {workerProfile.category}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3.5 border-t border-slate-100 pt-5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Hourly Rate</span>
                      <span className="font-extrabold text-slate-800">₱{workerProfile.hourlyRate.toFixed(2)}/hr</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Rating</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> {workerProfile.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-slate-400">Location</span>
                      <span className="font-medium text-slate-700 text-right">{workerProfile.locationName.split(',')[0]}</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-5 text-sm">
                    <span className="block font-bold text-slate-800">Skills</span>
                    <div className="flex flex-wrap gap-1">
                      {workerProfile.skills.map((skill, idx) => (
                        <span key={idx} className="text-xs px-2.5 py-1 bg-slate-50 text-slate-600 rounded-xl font-medium border border-slate-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom services manager */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-card p-6 shadow-sm border border-slate-100 space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <PlusCircle className="w-5 h-5 text-emerald-600" /> Add Custom Service Offering
                    </h3>
                    
                    <form onSubmit={handleAddService} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        className="input-field"
                        placeholder="Service Name (e.g. Sink Installation)"
                        value={newServiceForm.name}
                        onChange={(e) => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                      />
                      <select
                        className="input-field"
                        value={newServiceForm.category}
                        onChange={(e) => setNewServiceForm({ ...newServiceForm, category: e.target.value })}
                      >
                        {['Cleaning', 'Plumbing', 'Electrical', 'Carpentry', 'Handyman', 'Painting', 'Gardening', 'Other'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        required
                        className="input-field"
                        placeholder="Service Flat Rate (₱)"
                        value={newServiceForm.price}
                        onChange={(e) => setNewServiceForm({ ...newServiceForm, price: e.target.value })}
                      />
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Duration (e.g. 2 hours)"
                        value={newServiceForm.duration}
                        onChange={(e) => setNewServiceForm({ ...newServiceForm, duration: e.target.value })}
                      />
                      <textarea
                        className="input-field sm:col-span-2"
                        placeholder="Brief details about what the package includes..."
                        value={newServiceForm.description}
                        onChange={(e) => setNewServiceForm({ ...newServiceForm, description: e.target.value })}
                      />
                      <button type="submit" className="btn-primary sm:col-span-2 w-auto px-5 py-2.5">
                        Add Service Option
                      </button>
                    </form>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800">Your Active Service Offerings</h3>
                    
                    {workerServices.length === 0 ? (
                      <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-3xl text-slate-400 text-sm">
                        You have not configured any custom packages. Users will book you at your default hourly rate.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {workerServices.map(srv => (
                          <div key={srv._id} className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-slate-800 text-base">{srv.name}</h4>
                                <button
                                  onClick={() => handleDeleteService(srv._id)}
                                  className="text-slate-400 hover:text-red-500 p-1"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              </div>
                              <span className="inline-block text-xs font-semibold px-2 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-100">
                                {srv.category}
                              </span>
                              <p className="text-xs text-slate-400 line-clamp-2">{srv.description}</p>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-4 text-xs font-bold">
                              <span className="text-slate-400">Est: {srv.duration}</span>
                              <span className="text-emerald-700 text-sm">₱{srv.price.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl space-y-3 shadow-sm">
                <Star className="w-12 h-12 mx-auto text-slate-300" />
                <h3 className="text-lg font-bold text-slate-700">Setup your profile</h3>
                <p className="text-slate-400 max-w-sm mx-auto">Click Edit Profile above to enter your service details and appear in nearby user searches.</p>
              </div>
            )}
          </div>
        )}

        {/* My Bookings History List */}
        {user && activeTab === 'bookings' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 font-display">My Bookings</h1>
              <p className="text-sm text-slate-500">Track current service scheduling, payment validation, and complete orders</p>
            </div>

            {loadingBookings ? (
              <div className="space-y-4">
                {[1, 2].map(n => <div key={n} className="h-28 bg-slate-100 rounded-2xl animate-pulse"></div>)}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl space-y-3 shadow-sm">
                <Calendar className="w-12 h-12 mx-auto text-slate-300" />
                <h3 className="text-lg font-bold text-slate-700">No bookings found</h3>
                <p className="text-slate-400">Your scheduling calendar is currently empty.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const dateStr = new Date(booking.bookingDate).toLocaleDateString('en-US', {
                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                  });
                  const isWorker = user.role === 'WORKER';
                  const counterpart = isWorker ? booking.userId : booking.workerId;
                  
                  const statusColors = {
                    PENDING: 'bg-amber-50 text-amber-800 border-amber-200/50',
                    ACCEPTED: 'bg-emerald-50 text-emerald-800 border-emerald-200/50',
                    REJECTED: 'bg-red-50 text-red-800 border-red-200/50',
                    COMPLETED: 'bg-blue-50 text-blue-800 border-blue-200/50',
                    CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
                  };

                  return (
                    <div key={booking._id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-3.5">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-bold border rounded-full capitalize ${statusColors[booking.status]}`}>
                            {booking.status.toLowerCase()}
                          </span>
                          <span className={`px-3 py-1 text-xs font-bold border rounded-full capitalize ${booking.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'}`}>
                            {booking.paymentStatus.toLowerCase()}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-slate-800 text-lg">
                            {isWorker ? 'Job Request from ' : 'Service with '} {counterpart.fullName}
                          </h3>
                          <p className="text-xs text-slate-400 font-semibold">{counterpart.email} • {counterpart.phoneNumber}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-1.5 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-4.5 h-4.5 text-slate-400" /> {dateStr}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <Clock className="w-4.5 h-4.5 text-slate-400" /> {booking.bookingTime}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <MapPin className="w-4.5 h-4.5 text-slate-400" /> {booking.address.split(',')[0]}
                          </span>
                        </div>

                        {booking.description && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
                            <strong>Note:</strong> {booking.description}
                          </div>
                        )}
                      </div>

                      {/* Booking Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-end md:self-center">
                        <div className="text-right sm:pr-4 flex md:flex-col items-center md:items-end justify-between md:justify-center">
                          <span className="text-xs text-slate-400 font-semibold">Total Price</span>
                          <span className="font-extrabold text-slate-900 text-lg">₱{booking.amount.toFixed(2)}</span>
                        </div>

                        {/* Customer Cancel / Pay Actions */}
                        {!isWorker && (
                          <div className="flex gap-2">
                            {booking.paymentStatus === 'UNPAID' && booking.status !== 'CANCELLED' && booking.status !== 'REJECTED' && (
                              <button
                                onClick={() => setCheckoutBooking(booking)}
                                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                              >
                                Pay Now
                              </button>
                            )}
                            {(booking.status === 'PENDING' || booking.status === 'ACCEPTED') && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking._id, 'CANCELLED')}
                                className="px-4 py-2.5 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl text-xs font-bold transition-all"
                              >
                                Cancel Booking
                              </button>
                            )}
                          </div>
                        )}

                        {/* Worker Accept / Complete Actions */}
                        {isWorker && (
                          <div className="flex gap-2">
                            {booking.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleUpdateBookingStatus(booking._id, 'ACCEPTED')}
                                  className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                                >
                                  Accept Job
                                </button>
                                <button
                                  onClick={() => handleUpdateBookingStatus(booking._id, 'REJECTED')}
                                  className="px-4.5 py-2.5 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl text-xs font-bold transition-all"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {booking.status === 'ACCEPTED' && (
                              <>
                                <button
                                  onClick={() => handleUpdateBookingStatus(booking._id, 'COMPLETED')}
                                  className="px-4.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                                >
                                  Mark Completed
                                </button>
                                <button
                                  onClick={() => handleUpdateBookingStatus(booking._id, 'CANCELLED')}
                                  className="px-4.5 py-2.5 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl text-xs font-bold transition-all"
                                >
                                  Cancel Job
                                </button>
                              </>
                            )}
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

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-8 text-center text-xs text-slate-400 mt-12">
        <p>© 2026 Fix-Connect. Built securely for premium neighborhood servicing.</p>
      </footer>

      {/* BOOKING WIZARD MODAL */}
      {bookingWorker && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Schedule Service</h3>
                <p className="text-xs text-slate-500">Booking with {bookingWorker.userId.fullName}</p>
              </div>
              <button 
                onClick={() => setBookingWorker(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Preferred Date</label>
                  <input
                    type="date"
                    required
                    className="input-field py-2.5"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Preferred Time</label>
                  <input
                    type="time"
                    required
                    className="input-field py-2.5"
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                  />
                </div>
              </div>

              {/* Service Address Autocomplete */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-700">Service Address</label>
                <input
                  type="text"
                  required
                  className="input-field py-2.5"
                  placeholder="Search and select street address..."
                  value={bookingForm.address}
                  onChange={(e) => handleBookingLocationSearch(e.target.value)}
                  onFocus={() => setShowBookingAddressDropdown(true)}
                />
                
                {showBookingAddressDropdown && bookingAddressSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 z-50 text-slate-800 divide-y divide-slate-50 overflow-hidden max-h-40 overflow-y-auto">
                    {bookingAddressSuggestions.map((loc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectBookingLocation(loc)}
                        className="w-full px-3 py-2.5 text-left hover:bg-slate-50 text-xs flex items-start gap-2 transition-all"
                      >
                        <MapPin className="w-4.5 h-4.5 mt-0.5 text-slate-400 flex-shrink-0" />
                        <span>{loc.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Job Description / Instructions</label>
                <textarea
                  rows="3"
                  className="input-field py-2.5"
                  placeholder="Detail any specifics that the worker should know..."
                  value={bookingForm.description}
                  onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                />
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Worker Rate:</span>
                  <span className="font-semibold text-slate-700">₱{bookingWorker.hourlyRate.toFixed(2)}/hr</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimated Time:</span>
                  <span className="font-semibold text-slate-700">3.0 hrs (Minimum)</span>
                </div>
                <hr className="border-slate-200/60" />
                <div className="flex justify-between font-extrabold text-slate-800 text-base">
                  <span>Total (Estimated):</span>
                  <span>₱{(bookingWorker.hourlyRate * 3).toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3.5 mt-4">
                Confirm & Pay Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CHECKOUT / PAYMENT MODAL */}
      {checkoutBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Checkout Payment</h3>
                <p className="text-xs text-slate-500">Booking Ref: {checkoutBooking._id.substring(0, 8)}...</p>
              </div>
              <button 
                onClick={() => setCheckoutBooking(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymongoPayment} className="p-6 space-y-6">
              
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between text-emerald-800">
                <span className="text-sm font-semibold">Total Amount Due</span>
                <span className="text-xl font-extrabold">₱{checkoutBooking.amount.toFixed(2)}</span>
              </div>

              {/* Payment Method Selection tabs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gcash')}
                    className={`py-3 px-2 border rounded-xl flex flex-col items-center justify-center gap-1.5 font-bold text-xs transition-all ${paymentMethod === 'gcash' ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span>GCash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paymaya')}
                    className={`py-3 px-2 border rounded-xl flex flex-col items-center justify-center gap-1.5 font-bold text-xs transition-all ${paymentMethod === 'paymaya' ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span>PayMaya</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-3 px-2 border rounded-xl flex flex-col items-center justify-center gap-1.5 font-bold text-xs transition-all ${paymentMethod === 'card' ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Card</span>
                  </button>
                </div>
              </div>

              {/* Card input forms */}
              {paymentMethod === 'card' && (
                <div className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl animate-fade-in text-slate-800">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Card Number</label>
                    <input
                      type="text"
                      required
                      maxLength="16"
                      className="input-field py-2 bg-white"
                      placeholder="4111 2222 3333 4444"
                      value={cardForm.cardNumber}
                      onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Exp Month</label>
                      <input
                        type="text"
                        required
                        maxLength="2"
                        className="input-field py-2 bg-white text-center"
                        placeholder="MM"
                        value={cardForm.expMonth}
                        onChange={(e) => setCardForm({ ...cardForm, expMonth: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Exp Year</label>
                      <input
                        type="text"
                        required
                        maxLength="4"
                        className="input-field py-2 bg-white text-center"
                        placeholder="YYYY"
                        value={cardForm.expYear}
                        onChange={(e) => setCardForm({ ...cardForm, expYear: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">CVC</label>
                      <input
                        type="text"
                        required
                        maxLength="4"
                        className="input-field py-2 bg-white text-center"
                        placeholder="CVC"
                        value={cardForm.cvc}
                        onChange={(e) => setCardForm({ ...cardForm, cvc: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod !== 'card' && (
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upon clicking checkout, you will be securely redirected to the Paymongo sandboxed authorization URL to confirm the e-wallet transaction.
                </p>
              )}

              {paymentError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={paying}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
              >
                {paying ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
