import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookings, getBookingById, updateBookingStatus, sendChatMessage } from '../services/bookingService';
import { 
  Briefcase, CheckCircle, Clock, Check, X, ShieldAlert,
  MessageSquare, DollarSign, Calendar, MapPin, Phone, LogOut, Info, Star, ChevronRight
} from 'lucide-react';

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Gardening', 'Repair'];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
];

const WorkerPortal = () => {
  const { user, onboard, logout, refreshUserData } = useAuth();
  const [view, setView] = useState('jobs'); // 'jobs', 'earnings', 'profile', 'job-detail'
  
  // Onboarding States
  const [onboardSpecialty, setOnboardSpecialty] = useState(CATEGORIES[0]);
  const [onboardHourlyRate, setOnboardHourlyRate] = useState(150);
  const [onboardExperience, setOnboardExperience] = useState(3);
  const [onboardBio, setOnboardBio] = useState('');
  const [onboardAvatar, setOnboardAvatar] = useState(AVATAR_PRESETS[0]);
  const [onboardGovId, setOnboardGovId] = useState('');
  const [onboardCert, setOnboardCert] = useState('');
  const [onboardLoading, setOnboardLoading] = useState(false);

  // App States
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (user && user.onboardingCompleted && user.status === 'APPROVED') {
      fetchBookings();
    }
  }, [user]);

  // Polling active chats/jobs
  useEffect(() => {
    let interval;
    if (selectedBooking) {
      interval = setInterval(async () => {
        try {
          const updated = await getBookingById(selectedBooking._id);
          setSelectedBooking(updated);
        } catch (err) {
          console.error(err);
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

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!onboardBio || !onboardGovId) {
      alert('Biography and Government ID verification details are required.');
      return;
    }

    setOnboardLoading(true);
    try {
      await onboard({
        specialty: onboardSpecialty,
        hourlyRate: Number(onboardHourlyRate),
        experienceYears: Number(onboardExperience),
        bio: onboardBio,
        governmentId: onboardGovId,
        certificate: onboardCert || undefined,
        avatar: onboardAvatar,
      });
      refreshUserData();
    } catch (err) {
      alert(err);
    } finally {
      setOnboardLoading(false);
    }
  };

  const handleAcceptDecline = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      await fetchBookings();
      if (selectedBooking && selectedBooking._id === id) {
        const updated = await getBookingById(id);
        setSelectedBooking(updated);
      }
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

  // ------------------------------------------
  // ONBOARDING PAGE
  // ------------------------------------------
  if (!user.onboardingCompleted) {
    return (
      <div className="p-6 flex flex-col h-full bg-slate-50 justify-center text-left">
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-slate-800">Worker Registration</h2>
          <p className="text-xs text-slate-500 mt-1">Complete your service provider profile</p>
        </div>

        <form onSubmit={handleOnboardSubmit} className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
          {/* Avatar preset selection */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Profile Photo
            </label>
            <div className="flex justify-center space-x-3">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setOnboardAvatar(preset)}
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                    onboardAvatar === preset ? 'border-primary-500 scale-105 shadow-sm' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={preset} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                Specialty Category
              </label>
              <select
                value={onboardSpecialty}
                onChange={(e) => setOnboardSpecialty(e.target.value)}
                className="input-field text-xs py-2 bg-white border-slate-200"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                Hourly Rate (PHP)
              </label>
              <input
                type="number"
                value={onboardHourlyRate}
                onChange={(e) => setOnboardHourlyRate(parseInt(e.target.value) || 0)}
                className="input-field text-xs py-2 bg-white border-slate-200"
                min="50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                Years of Experience
              </label>
              <input
                type="number"
                value={onboardExperience}
                onChange={(e) => setOnboardExperience(parseInt(e.target.value) || 0)}
                className="input-field text-xs py-2 bg-white border-slate-200"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                Gov ID/License #
              </label>
              <input
                type="text"
                value={onboardGovId}
                onChange={(e) => setOnboardGovId(e.target.value)}
                placeholder="ID number or verification URL"
                className="input-field text-xs py-2 bg-white border-slate-200"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">
              Professional Biography (Bio)
            </label>
            <textarea
              value={onboardBio}
              onChange={(e) => setOnboardBio(e.target.value)}
              placeholder="Tell clients about your expertise, background, and promptness..."
              className="input-field text-xs min-h-16 bg-white border-slate-200"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide">
              Professional Certificate (Optional)
            </label>
            <input
              type="text"
              value={onboardCert}
              onChange={(e) => setOnboardCert(e.target.value)}
              placeholder="License link or certificate reference"
              className="input-field text-xs py-2 bg-white border-slate-200"
            />
          </div>

          <button
            type="submit"
            disabled={onboardLoading}
            className="btn-primary w-full py-2.5 text-xs font-bold cursor-pointer mt-4"
          >
            {onboardLoading ? 'Submitting...' : 'Register Profile'}
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
  // ACCOUNT UNDER VERIFICATION SCREEN
  // ------------------------------------------
  if (user.status !== 'APPROVED') {
    return (
      <div className="p-6 flex flex-col h-full bg-slate-50 justify-center items-center text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100">
          <ShieldAlert className="w-8 h-8 text-amber-500 animate-bounce" />
        </div>

        <h3 className="text-lg font-bold text-slate-800 leading-tight">
          {user.status === 'PENDING_APPROVAL' ? 'Profile Under Review' : 'Profile Declined'}
        </h3>
        
        <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
          {user.status === 'PENDING_APPROVAL' 
            ? 'We are reviewing your professional credentials, government identification documents, and hourly rates. You will receive access once approved by our admin team.' 
            : 'Your professional credentials did not pass our safety standards. Please reach out to support or submit valid documentation.'
          }
        </p>

        <div className="mt-8 space-y-3 w-full max-w-[240px]">
          <button
            onClick={refreshUserData}
            className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-700 cursor-pointer"
          >
            Check Status Again
          </button>
          <button
            onClick={logout}
            className="w-full py-2 bg-white border border-slate-200 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-50 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // APPROVED WORKER SCREEN CORE
  // ------------------------------------------
  const activeBookings = bookings.filter(b => b.status === 'PENDING');
  const ongoingBookings = bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS');
  const pastBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'DECLINED' || b.status === 'CANCELLED');
  
  // Total earnings count
  const totalEarnings = bookings
    .filter(b => b.status === 'COMPLETED' && b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + b.price, 0);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative select-none">
      
      {/* Header bar */}
      <div className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-30 shadow-xs">
        {view === 'job-detail' ? (
          <button 
            onClick={() => setView('jobs')} 
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <img 
              src={user.avatar || AVATAR_PRESETS[0]} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full object-cover border border-slate-100" 
            />
            <div className="text-left leading-none">
              <div className="text-xs text-slate-400">Worker Dashboard,</div>
              <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{user.fullName}</div>
            </div>
          </div>
        )}
        <div className="text-xs font-bold text-slate-700 font-display">
          {view === 'jobs' && 'Active Jobs'}
          {view === 'earnings' && 'Earnings History'}
          {view === 'profile' && 'Professional Profile'}
          {view === 'job-detail' && 'Job Execution'}
        </div>
        <button 
          onClick={logout} 
          className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Main panel scroll */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 text-left">
        
        {/* VIEW: JOBS QUEUE */}
        {view === 'jobs' && (
          <div className="space-y-5 animate-fade-in">
            {/* Status Summary Widget */}
            <div className="bg-gradient-to-tr from-slate-900 to-slate-800 p-4 rounded-2xl text-white shadow-md flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Availability</span>
                <span className="text-xs font-black text-emerald-400 mt-1 block">ONLINE &bull; AVAILABLE</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Rating Score</span>
                <span className="text-xs font-black text-amber-400 mt-1 flex items-center justify-end">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                  {user.rating.toFixed(1)} ({user.ratingsCount})
                </span>
              </div>
            </div>

            {/* Inbound Booking Requests (Pending) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inbound Requests ({activeBookings.length})</h4>
                <button 
                  onClick={fetchBookings} 
                  className="text-[10px] text-primary-600 font-semibold cursor-pointer"
                >
                  Refresh
                </button>
              </div>

              {bookingsLoading ? (
                <div className="text-center py-4 text-xs text-slate-400">Loading requests...</div>
              ) : activeBookings.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-xl p-5 text-center text-xs text-slate-400">
                  No pending service requests available.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeBookings.map((b) => (
                    <div 
                      key={b._id} 
                      className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs text-left space-y-2.5"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-xs font-bold text-slate-800">{b.userId?.fullName}</h5>
                          <span className="text-[9px] text-slate-400">{b.serviceType} &bull; {new Date(b.scheduledAt).toLocaleDateString()}</span>
                        </div>
                        <span className="text-xs font-black text-primary-600">PHP {b.price}</span>
                      </div>
                      
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 bg-slate-50 p-2 rounded-lg">
                        "{b.description}"
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleAcceptDecline(b._id, 'DECLINED')}
                          className="py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500 text-center cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleAcceptDecline(b._id, 'ACCEPTED')}
                          className="py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-[10px] font-bold text-center cursor-pointer"
                        >
                          Accept Job
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Active Projects (Ongoing) */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Active Projects</h4>
              {ongoingBookings.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-xl p-5 text-center text-xs text-slate-400">
                  No active projects. Accept an inbound request above to start.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {ongoingBookings.map((b) => (
                    <div
                      key={b._id}
                      onClick={() => {
                        setSelectedBooking(b);
                        setView('job-detail');
                      }}
                      className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs hover:border-slate-200 cursor-pointer flex items-center justify-between"
                    >
                      <div className="text-left">
                        <h5 className="text-xs font-bold text-slate-800">{b.userId?.fullName}</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">{b.serviceType} &bull; {new Date(b.scheduledAt).toLocaleDateString()}</p>
                        <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded mt-1.5 leading-none ${
                          b.status === 'ACCEPTED' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {b.status === 'ACCEPTED' ? 'Accepted' : 'In Progress'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-800 block">PHP {b.price}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 mt-1.5 inline-block" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: JOB DETAILS & CHAT & ADVANCEMENT */}
        {view === 'job-detail' && selectedBooking && (
          <div className="space-y-4 animate-fade-in pb-4">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setView('jobs')} 
                className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <h3 className="text-sm font-bold text-slate-800">Job Detail</h3>
            </div>

            {/* Client Profile Card */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs text-left flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedBooking.userId?.avatar || AVATAR_PRESETS[0]}
                  alt="client"
                  className="w-12 h-12 rounded-full object-cover border border-slate-100"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{selectedBooking.userId?.fullName}</h4>
                  <p className="text-[9px] text-slate-400 flex items-center mt-0.5">
                    <Phone className="w-2.5 h-2.5 mr-1" />
                    {selectedBooking.userId?.phoneNumber}
                  </p>
                  <p className="text-[9px] text-slate-400 flex items-center mt-0.5">
                    <MapPin className="w-2.5 h-2.5 mr-1" />
                    {selectedBooking.userId?.address}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-800">PHP {selectedBooking.price}</span>
                <span className={`block text-[8px] font-extrabold px-1.5 py-0.5 rounded mt-1 text-center ${
                  selectedBooking.status === 'ACCEPTED' ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'
                }`}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            {/* Job Summary Description */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs space-y-2.5 text-xs text-left">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Client Description</span>
                <p className="text-slate-700 font-medium mt-0.5">"{selectedBooking.description}"</p>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Scheduled Date/Time</span>
                <p className="text-slate-700 font-semibold mt-0.5">
                  {new Date(selectedBooking.scheduledAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* WORKER ACTION CONTROL BUTTONS */}
            <div className="space-y-2">
              {selectedBooking.status === 'ACCEPTED' && (
                <button
                  onClick={() => handleAcceptDecline(selectedBooking._id, 'IN_PROGRESS')}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer text-center"
                >
                  Start Work (In Progress)
                </button>
              )}
              {selectedBooking.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleAcceptDecline(selectedBooking._id, 'COMPLETED')}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer text-center animate-pulse"
                >
                  Complete Job & Send Invoice
                </button>
              )}
            </div>

            {/* LIVE COORDINATION CHAT DRAWER */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-2xs overflow-hidden flex flex-col h-64">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-primary-500" />
                <span className="text-[10px] font-bold text-slate-600">Coordinate with Client</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {selectedBooking.chat && selectedBooking.chat.length === 0 ? (
                  <div className="text-center text-[10px] text-slate-400 py-12">No messages. Type a message below to coordinate.</div>
                ) : (
                  selectedBooking.chat?.map((msg, index) => {
                    const isMe = msg.senderId === user.id || msg.senderId === user._id;
                    return (
                      <div
                        key={index}
                        className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
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
                  placeholder="Type message here..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-100 rounded-lg outline-none"
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
          </div>
        )}

        {/* VIEW: EARNINGS ANALYTICS */}
        {view === 'earnings' && (
          <div className="space-y-5 animate-fade-in text-left">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Earnings History</h3>
            
            {/* Earnings KPI Card */}
            <div className="bg-gradient-to-tr from-emerald-600 to-emerald-500 p-4 rounded-2xl text-white shadow-md flex justify-between items-center">
              <div>
                <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider block leading-none">Total Balance Earned</span>
                <span className="text-xl font-black mt-1 block">PHP {totalEarnings.toFixed(2)}</span>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-100/40" />
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Earnings per Category</h4>
              {bookings.filter(b => b.status === 'COMPLETED').length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">Complete jobs to build charts.</div>
              ) : (
                <div className="h-32 flex items-end space-x-4 pt-4 px-2 select-none">
                  {['Plumbing', 'Electrical', 'Cleaning', 'Repair'].map((cat) => {
                    const catTotal = bookings
                      .filter(b => b.status === 'COMPLETED' && b.serviceType === cat && b.paymentStatus === 'PAID')
                      .reduce((sum, b) => sum + b.price, 0);

                    // Compute height percentage relative to total earnings
                    const maxVal = totalEarnings || 1;
                    const pctHeight = Math.min(100, Math.max(10, (catTotal / maxVal) * 100));

                    return (
                      <div key={cat} className="flex-1 flex flex-col items-center">
                        <span className="text-[9px] font-bold text-slate-600 mb-1">₱{catTotal}</span>
                        <div 
                          className="w-full bg-primary-500 rounded-t-md transition-all duration-500" 
                          style={{ height: `${pctHeight}px` }}
                        ></div>
                        <span className="text-[8px] font-bold text-slate-400 mt-2 truncate max-w-full">{cat}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Completed transactions grid list */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Paid Invoices</h4>
              {pastBookings.filter(b => b.status === 'COMPLETED').length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-xl p-5 text-center text-xs text-slate-400">No completed jobs yet.</div>
              ) : (
                <div className="space-y-2.5">
                  {pastBookings
                    .filter(b => b.status === 'COMPLETED')
                    .map((b) => (
                      <div 
                        key={b._id}
                        className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800 block">{b.userId?.fullName}</span>
                          <span className="text-[9px] text-slate-400">{b.serviceType} &bull; {new Date(b.completedAt || b.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-emerald-600 block">PHP {b.price}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">{b.paymentStatus}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: WORKER PROFILE VIEW */}
        {view === 'profile' && (
          <div className="space-y-4 animate-fade-in text-left">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Professional Profile</h3>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs text-center flex flex-col items-center">
              <img
                src={user.avatar || AVATAR_PRESETS[0]}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border border-slate-100 shadow-sm mb-2"
              />
              <h4 className="text-sm font-bold text-slate-800">{user.fullName}</h4>
              <p className="text-xs text-primary-600 font-bold">{user.specialty} Provider</p>
              <p className="text-[9px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded mt-2 flex items-center leading-none">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                Approved &bull; {user.rating.toFixed(1)} ({user.ratingsCount} reviews)
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs space-y-3 text-xs">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Email</span>
                <span className="font-semibold text-slate-800">{user.email}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Phone Number</span>
                <span className="font-semibold text-slate-800">{user.phoneNumber}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Hourly Rate</span>
                <span className="font-semibold text-slate-800">PHP {user.hourlyRate}/hr</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">License ID</span>
                <span className="font-semibold text-slate-800">{user.governmentId}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Bio</span>
                <p className="text-slate-600 mt-1 italic">"{user.bio}"</p>
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
          onClick={() => setView('jobs')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            view === 'jobs' || view === 'job-detail' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Briefcase className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold">Jobs</span>
        </button>
        <button
          onClick={() => setView('earnings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            view === 'earnings' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <DollarSign className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold">Earnings</span>
        </button>
        <button
          onClick={() => setView('profile')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            view === 'profile' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <CheckCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold">Verify</span>
        </button>
      </div>

    </div>
  );
};

export default WorkerPortal;
