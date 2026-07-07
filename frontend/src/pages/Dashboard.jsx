import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Search, MapPin, Calendar, Clock, Star, 
  Send, Image, User as UserIcon, Tag, HelpCircle, 
  Info, LogOut, CheckCircle, AlertCircle, X, Sparkles, Navigation
} from 'lucide-react';
import api from '../utils/api';
import logo from '../assets/logo.png';
import CustomDrawer from '../components/CustomDrawer';
import CustomModal from '../components/CustomModal';
import MapView from '../components/MapView';
import { ServicesGridSkeleton, BookingsListSkeleton, BannerSkeleton } from '../components/SkeletalLoader';
import { io } from 'socket.io-client';

export default function Dashboard({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Modal states
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState(null);
  
  // Support ticket
  const [supportCategory, setSupportCategory] = useState('General');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSuccess, setSupportSuccess] = useState('');

  // Booking states
  const [selectedService, setSelectedService] = useState(null);
  const [problemDescription, setProblemDescription] = useState('');
  const [bookingAddress, setBookingAddress] = useState('123 Taft Ave, Manila, Metro Manila');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Core Data
  const [services, setServices] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingActiveBooking, setLoadingActiveBooking] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Profile data
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAddress, setProfileAddress] = useState(user?.address || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Chat/Inbox States
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChatUser, setSelectedChatUser] = useState({
    id: 'system_support',
    name: 'FixConnect Helpdesk',
    avatar: 'H'
  });

  const chatEndRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch Services
  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data.services);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  // Fetch Active Booking
  const fetchActiveBooking = async () => {
    try {
      const response = await api.get('/bookings/active');
      setActiveBooking(response.data.booking);
      if (response.data.booking?.provider_id) {
        // If assigned, set active chat with technician
        setSelectedChatUser({
          id: response.data.booking.provider_id._id,
          name: response.data.booking.provider_id.name,
          avatar: response.data.booking.provider_id.name.charAt(0).toUpperCase()
        });
      }
    } catch (err) {
      console.error('Error fetching active booking:', err);
    } finally {
      setLoadingActiveBooking(false);
    }
  };

  // Fetch Booking History
  const fetchBookingHistory = async () => {
    try {
      const response = await api.get('/bookings/history');
      setBookingHistory(response.data.bookings || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchActiveBooking();
    fetchBookingHistory();

    // Socket.io initialization for real-time messaging
    const resolvedBase = api.defaults.baseURL || 'http://localhost:5000/api';
    const socketUrl = resolvedBase.replace('/api', '');
    
    const socket = io(socketUrl, {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    if (user?.id) {
      socket.on(`message:${user.id}`, (incomingMsg) => {
        setMessages((prev) => [...prev, incomingMsg]);
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Load chat messages when active provider changes
  useEffect(() => {
    const fetchChatMessages = async () => {
      if (!selectedChatUser?.id) return;
      try {
        const response = await api.get(`/messages/${selectedChatUser.id}`);
        setMessages(response.data.messages || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchChatMessages();
  }, [selectedChatUser]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
  };

  // Validate Promo Code
  const handleValidatePromo = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    try {
      const response = await api.post('/promos/validate', { code: promoCode });
      setPromoMessage({ success: true, text: `Code applied: ₱${response.data.promo.discount_amount} Discount!` });
    } catch (err) {
      setPromoMessage({ success: false, text: err.response?.data?.message || 'Invalid code.' });
    }
  };

  // Submit Support Ticket
  const handleSubmitSupport = async (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    try {
      await api.post('/support/tickets', {
        category: supportCategory,
        message: supportMessage.trim(),
      });
      setSupportSuccess('Help request submitted successfully. A representative will contact you soon.');
      setSupportMessage('');
      setTimeout(() => {
        setIsHelpModalOpen(false);
        setSupportSuccess('');
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Initiate Booking Modal
  const openBookingModal = (service) => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  // Submit Booking
  const handlePlaceBooking = async (e) => {
    e.preventDefault();
    if (!problemDescription.trim()) return;

    try {
      // 1. Create Draft
      const draftRes = await api.post('/bookings/draft', {
        service_id: selectedService._id,
        latitude: 14.5995,
        longitude: 120.9842,
        formatted_address: bookingAddress,
        problem_description: problemDescription.trim(),
      });

      const draftId = draftRes.data.booking._id;

      // 2. Request Provider
      const requestRes = await api.post(`/bookings/${draftId}/request`);
      
      setBookingSuccess('Service booked successfully! Searching for technicians nearby...');
      setProblemDescription('');
      
      setTimeout(() => {
        setIsBookingModalOpen(false);
        setBookingSuccess(null);
        fetchActiveBooking();
        fetchBookingHistory();
      }, 2500);

    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { data } = await api.post('/messages', {
        receiver_id: selectedChatUser.id,
        text: newMessage.trim(),
      });
      
      // Optimistically push if socket didn't broadcast yet
      setMessages((prev) => {
        if (prev.find(m => m._id === data.message._id)) return prev;
        return [...prev, data.message];
      });
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/auth/profile', {
        name: profileName,
        phone: profilePhone,
        address: profileAddress,
      });
      
      // Update local storage
      const updatedUser = { ...user, name: profileName, phone: profilePhone, address: profileAddress };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfileSuccess('Profile saved successfully!');
      
      setTimeout(() => {
        setProfileSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <div className="app-container">
      {/* Drawer menu / Sidebar */}
      <CustomDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onPromoPress={() => setIsPromoModalOpen(true)}
        onHelpPress={() => setIsHelpModalOpen(true)}
        onAboutPress={() => setIsAboutModalOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Mobile top-bar */}
        <header className="mobile-header">
          <button className="mobile-menu-btn" onClick={() => setIsDrawerOpen(true)}>
            <Menu size={24} />
          </button>
          <span className="mobile-brand">FixConnect</span>
          <div style={{ width: 40 }} />
        </header>

        {/* Tab Subviews */}
        <main style={styles.subviewPadding}>
          {activeTab === 'home' && (
            <div style={styles.tabContent}>
              {/* Header Title */}
              <div style={styles.dashHeader}>
                <h1 style={styles.dashTitle}>Instant Home Service</h1>
                <p style={styles.dashSubtitle}>Select a category to dispatch a professional technician</p>
              </div>

              {/* Active Booking Monitor Banner */}
              {loadingActiveBooking ? (
                <BannerSkeleton />
              ) : activeBooking ? (
                <div style={styles.activeBanner}>
                  <div style={styles.bannerLeft}>
                    <CheckCircle size={24} color="#2E7D32" />
                    <div>
                      <h4 style={styles.bannerTitle}>Active Job: {activeBooking.service_id?.title}</h4>
                      <p style={styles.bannerStatus}>
                        Status: <span style={styles.statusBadge}>{activeBooking.status}</span>
                      </p>
                    </div>
                  </div>
                  <div style={styles.bannerRight}>
                    <button className="btn btn-primary" onClick={() => setActiveTab('bookings')} style={styles.bannerBtn}>
                      Track Order
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Live Map Radar Simulation */}
              <div style={styles.mapCard}>
                <MapView 
                  userLocation={{ latitude: 14.5995, longitude: 120.9842 }} 
                  providerLocation={activeBooking?.provider_id ? { bearing: 60 } : null}
                  height={320}
                />
              </div>

              {/* Services List */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Our Services</h2>
                {loadingServices ? (
                  <ServicesGridSkeleton />
                ) : services.length === 0 ? (
                  <div style={styles.noData}>No services available at the moment.</div>
                ) : (
                  <div className="services-grid">
                    {services.map((service) => (
                      <div 
                        key={service._id} 
                        className="service-card"
                        onClick={() => openBookingModal(service)}
                      >
                        <div className="service-card-icon">
                          <Sparkles size={24} />
                        </div>
                        <h3 className="service-card-title">{service.title}</h3>
                        <p className="service-card-desc">{service.description}</p>
                        <div style={styles.servicePrice}>₱{service.base_rate} base</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div style={styles.tabContent}>
              <h1 style={styles.tabTitle}>My Bookings</h1>
              
              {loadingHistory ? (
                <BookingsListSkeleton />
              ) : bookingHistory.length === 0 ? (
                <div style={styles.noDataBox}>
                  <AlertCircle size={32} color="#94A3B8" />
                  <p>You haven't booked any services yet.</p>
                </div>
              ) : (
                <div style={styles.bookingsList}>
                  {bookingHistory.map((booking) => (
                    <div key={booking._id} style={styles.bookingItem}>
                      <div style={styles.bookingHeader}>
                        <h3 style={styles.bookingServiceTitle}>{booking.service_id?.title}</h3>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: booking.status === 'COMPLETED' ? '#E8F5E9' : '#FFF3E0',
                          color: booking.status === 'COMPLETED' ? '#2E7D32' : '#F57C00',
                        }}>
                          {booking.status}
                        </span>
                      </div>
                      <p style={styles.bookingDesc}>{booking.problem_description}</p>
                      <div style={styles.bookingMeta}>
                        <div style={styles.metaRow}>
                          <MapPin size={14} color="#64748B" />
                          <span>{booking.formatted_address}</span>
                        </div>
                        <div style={styles.metaRow}>
                          <Clock size={14} color="#64748B" />
                          <span>{new Date(booking.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div style={styles.priceRow}>
                        <span>Total Paid:</span>
                        <span style={styles.priceText}>₱{booking.total_amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'inbox' && (
            <div style={styles.inboxWrapper}>
              {/* Chat Sidebar */}
              <div style={styles.chatSidebar}>
                <div style={styles.chatSidebarHeader}>Inbox Conversations</div>
                <div style={styles.chatUserItem}>
                  <div style={styles.avatarCircle}>{selectedChatUser.avatar}</div>
                  <div style={styles.chatUserInfo}>
                    <div style={styles.chatUserName}>{selectedChatUser.name}</div>
                    <div style={styles.chatUserStatus}>Online Support</div>
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div style={styles.chatArea}>
                <div style={styles.chatAreaHeader}>
                  <div style={styles.avatarCircle}>{selectedChatUser.avatar}</div>
                  <div style={{ marginLeft: 12 }}>
                    <div style={styles.chatUserName}>{selectedChatUser.name}</div>
                    <div style={styles.chatUserOnlineBadge}>Active Provider Channel</div>
                  </div>
                </div>

                <div style={styles.messagesList}>
                  {messages.length === 0 ? (
                    <div style={styles.noChatText}>Send a message to start conversing with your technician.</div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === user.id;
                      return (
                        <div key={msg._id} style={{
                          ...styles.msgRow,
                          justifyContent: isMe ? 'flex-end' : 'flex-start',
                        }}>
                          <div style={{
                            ...styles.msgBubble,
                            backgroundColor: isMe ? '#2E7D32' : '#FFFFFF',
                            color: isMe ? '#FFFFFF' : '#1E293B',
                            border: isMe ? 'none' : '1px solid #E2E8F0',
                            borderBottomRightRadius: isMe ? 4 : 16,
                            borderBottomLeftRadius: isMe ? 16 : 4,
                          }}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} style={styles.chatInputRow}>
                  <input
                    type="text"
                    style={styles.chatInput}
                    placeholder="Type message here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" style={styles.chatSendBtn}>
                    <Send size={18} color="#FFF" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={styles.tabContent}>
              <h1 style={styles.tabTitle}>My Profile</h1>
              <div style={styles.profileCard}>
                {profileSuccess && <div className="success-box" style={styles.successAlert}>{profileSuccess}</div>}

                <form onSubmit={handleUpdateProfile}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="input-container">
                      <span className="input-icon"><UserIcon size={18} /></span>
                      <input
                        type="text"
                        className="form-control"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="input-container">
                      <span className="input-icon"><Clock size={18} /></span>
                      <input
                        type="tel"
                        className="form-control"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Home Address</label>
                    <div className="input-container">
                      <span className="input-icon"><MapPin size={18} /></span>
                      <input
                        type="text"
                        className="form-control"
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={styles.profileSaveBtn}>
                    Save Profile Changes
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- PROMO MODAL --- */}
      <CustomModal
        visible={isPromoModalOpen}
        onClose={() => {
          setIsPromoModalOpen(false);
          setPromoCode('');
          setPromoMessage(null);
        }}
        title="Apply Promo Code"
      >
        <form onSubmit={handleValidatePromo}>
          <div className="form-group">
            <label className="form-label">Enter Coupon Code</label>
            <div className="input-container">
              <span className="input-icon"><Tag size={18} /></span>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. FIX50"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                required
              />
            </div>
          </div>
          {promoMessage && (
            <div style={{
              ...styles.promoAlert,
              color: promoMessage.success ? '#2E7D32' : '#EF5350',
              backgroundColor: promoMessage.success ? '#E8F5E9' : '#FFF5F5',
              borderColor: promoMessage.success ? '#A5D6A7' : '#FEB2B2',
            }}>
              {promoMessage.text}
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 44 }}>
            Apply Code
          </button>
        </form>
      </CustomModal>

      {/* --- HELP & SUPPORT MODAL --- */}
      <CustomModal
        visible={isHelpModalOpen}
        onClose={() => {
          setIsHelpModalOpen(false);
          setSupportMessage('');
          setSupportSuccess('');
        }}
        title="Help & Support"
      >
        <form onSubmit={handleSubmitSupport}>
          <div className="form-group">
            <label className="form-label">Support Category</label>
            <select 
              value={supportCategory} 
              onChange={(e) => setSupportCategory(e.target.value)}
              style={styles.selectInput}
            >
              <option value="General">General Inquiry</option>
              <option value="Booking">Booking Concerns</option>
              <option value="Payment">Payment & Fare Issues</option>
              <option value="Technical">Technical Bugs</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Describe your concern</label>
            <textarea
              className="form-control"
              placeholder="Provide detail on how we can assist you..."
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              style={styles.textArea}
              required
            ></textarea>
          </div>
          {supportSuccess && (
            <div style={styles.supportAlert}>
              {supportSuccess}
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 44 }}>
            Submit Ticket
          </button>
        </form>
      </CustomModal>

      {/* --- ABOUT PLATFORM MODAL --- */}
      <CustomModal
        visible={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        title="About Platform"
      >
        <div style={styles.aboutBox}>
          <img src={logo} alt="FixConnect Logo" style={styles.aboutLogo} />
          <h3 style={styles.aboutTitle}>FixConnect</h3>
          <p style={styles.aboutVer}>Version 1.0.0 (Web Client)</p>
          <p style={styles.aboutDesc}>
            FixConnect is an elite, on-demand home service booking application matching households with verified service technicians. 
          </p>
          <div style={styles.aboutDivider}></div>
          <p style={styles.aboutCopyright}>© 2026 FixConnect, Inc. All rights reserved.</p>
        </div>
      </CustomModal>

      {/* --- QUICK SERVICE BOOKING DIALOG MODAL --- */}
      <CustomModal
        visible={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setProblemDescription('');
          setBookingSuccess(null);
        }}
        title={`Request ${selectedService?.title}`}
      >
        <form onSubmit={handlePlaceBooking}>
          <div style={styles.bookingServiceDetail}>
            <strong>Rate:</strong> ₱{selectedService?.base_rate} ({selectedService?.rate_type})
          </div>
          <div className="form-group">
            <label className="form-label">Address Location</label>
            <div className="input-container">
              <span className="input-icon"><MapPin size={18} /></span>
              <input
                type="text"
                className="form-control"
                value={bookingAddress}
                onChange={(e) => setBookingAddress(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Describe your problem</label>
            <textarea
              className="form-control"
              placeholder="e.g. Toilet drain overflowing, pipe leaking under kitchen counter..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              style={styles.textArea}
              required
            ></textarea>
          </div>
          {bookingSuccess && (
            <div style={styles.bookingSuccessBox}>
              {bookingSuccess}
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 48 }}>
            Confirm Dispatch Request
          </button>
        </form>
      </CustomModal>
    </div>
  );
}

const styles = {
  subviewPadding: {
    padding: '30px',
    flex: 1,
    overflowY: 'auto',
  },
  tabContent: {
    animation: 'fadeIn 0.3s ease-out',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  dashHeader: {
    marginBottom: '24px',
  },
  dashTitle: {
    fontSize: '28px',
    color: '#1E293B',
    fontWeight: '800',
    fontFamily: "'Outfit', sans-serif",
  },
  dashSubtitle: {
    fontSize: '14px',
    color: '#64748B',
    marginTop: '4px',
  },
  activeBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E9',
    border: '1px solid #A5D6A7',
    borderRadius: '16px',
    padding: '16px 24px',
    marginBottom: '24px',
    gap: 16,
    flexWrap: 'wrap',
  },
  bannerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  bannerTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#2E7D32',
  },
  bannerStatus: {
    fontSize: '12px',
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#2E7D32',
    color: '#FFF',
    fontSize: '10px',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  bannerBtn: {
    padding: '8px 16px',
    fontSize: '13px',
  },
  mapCard: {
    marginBottom: '30px',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '20px',
    color: '#1E293B',
    fontWeight: '700',
    marginBottom: '16px',
  },
  servicePrice: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: '12px',
    backgroundColor: '#E8F5E9',
    padding: '2px 8px',
    borderRadius: '8px',
  },
  noData: {
    color: '#64748B',
    textAlign: 'center',
    padding: '24px 0',
  },
  tabTitle: {
    fontSize: '26px',
    color: '#1E293B',
    fontWeight: '800',
    marginBottom: '24px',
  },
  noDataBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    backgroundColor: '#FFF',
    borderRadius: '16px',
    border: '1.5px solid #E2E8F0',
    color: '#64748B',
    gap: 12,
  },
  bookingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  bookingItem: {
    backgroundColor: '#FFF',
    borderRadius: '16px',
    border: '1.5px solid #E2E8F0',
    padding: '24px',
    transition: 'border-color 0.2s',
  },
  bookingHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  bookingServiceTitle: {
    fontSize: '18px',
    fontWeight: '700',
  },
  badge: {
    fontSize: '11px',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  bookingDesc: {
    fontSize: '14px',
    color: '#64748B',
    lineHeight: '20px',
    marginBottom: '16px',
  },
  bookingMeta: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    borderBottom: '1px solid #F1F5F9',
    paddingBottom: '16px',
    marginBottom: '16px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '13px',
    color: '#64748B',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '600',
  },
  priceText: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#2E7D32',
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: '20px',
    border: '1.5px solid #E2E8F0',
    padding: '30px',
    maxWidth: '520px',
  },
  profileSaveBtn: {
    width: '100%',
    height: 48,
    marginTop: 12,
  },
  selectInput: {
    width: '100%',
    height: '48px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '12px',
    padding: '0 16px',
    fontSize: '14px',
    backgroundColor: '#F8FAFC',
    outline: 'none',
  },
  textArea: {
    width: '100%',
    height: '100px',
    resize: 'none',
    border: 'none',
    outline: 'none',
    padding: '12px 0',
  },
  promoAlert: {
    border: '1.5px solid',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '16px',
    textAlign: 'center',
  },
  supportAlert: {
    backgroundColor: '#F0FDF4',
    border: '1.5px solid #BBF7D0',
    color: '#16A34A',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '16px',
    textAlign: 'center',
  },
  successAlert: {
    backgroundColor: '#F0FDF4',
    border: '1.5px solid #BBF7D0',
    color: '#16A34A',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '20px',
    textAlign: 'center',
  },
  aboutBox: {
    textAlign: 'center',
  },
  aboutLogo: {
    width: '80px',
    height: '80px',
    borderRadius: '40px',
    marginBottom: '16px',
  },
  aboutTitle: {
    fontSize: '22px',
    color: '#1E293B',
    fontWeight: '800',
  },
  aboutVer: {
    fontSize: '12px',
    color: '#64748B',
    marginTop: '2px',
  },
  aboutDesc: {
    fontSize: '14px',
    color: '#64748B',
    lineHeight: '20px',
    marginTop: '16px',
    padding: '0 12px',
  },
  aboutDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    margin: '20px 0',
  },
  aboutCopyright: {
    fontSize: '12px',
    color: '#94A3B8',
  },
  bookingServiceDetail: {
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  bookingSuccessBox: {
    backgroundColor: '#F0FDF4',
    border: '1.5px solid #BBF7D0',
    color: '#16A34A',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '16px',
    textAlign: 'center',
  },
  inboxWrapper: {
    display: 'flex',
    height: 'calc(100vh - 120px)',
    backgroundColor: '#FFF',
    borderRadius: '20px',
    border: '1.5px solid #E2E8F0',
    overflow: 'hidden',
    animation: 'fadeIn 0.3s ease-out',
  },
  chatSidebar: {
    width: '300px',
    borderRight: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F8FAFC',
  },
  chatSidebarHeader: {
    padding: '20px 24px',
    fontSize: '14px',
    fontWeight: '800',
    color: '#1E293B',
    borderBottom: '1px solid #E2E8F0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  chatUserItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #E2E8F0',
    backgroundColor: '#FFF',
    cursor: 'pointer',
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: '#2E7D32',
    color: '#FFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  chatUserInfo: {
    flex: 1,
  },
  chatUserName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1E293B',
  },
  chatUserStatus: {
    fontSize: '11px',
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 2,
  },
  chatUserOnlineBadge: {
    fontSize: '11px',
    color: '#64748B',
    marginTop: 2,
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  chatAreaHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#FFF',
    borderBottom: '1px solid #E2E8F0',
  },
  messagesList: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  noChatText: {
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: '13px',
    marginTop: '60px',
  },
  msgRow: {
    display: 'flex',
    width: '100%',
  },
  msgBubble: {
    maxWidth: '70%',
    padding: '12px 18px',
    borderRadius: '16px',
    fontSize: '14px',
    lineHeight: '20px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
  },
  chatInputRow: {
    display: 'flex',
    padding: '16px 24px',
    backgroundColor: '#FFF',
    borderTop: '1px solid #E2E8F0',
    gap: 12,
  },
  chatInput: {
    flex: 1,
    height: '44px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '12px',
    padding: '0 16px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#F8FAFC',
  },
  chatSendBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: '#2E7D32',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(46, 125, 50, 0.2)',
  },
};

// Add desktop styles media query override
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    @media (min-width: 901px) {
      .app-container {
        flex-direction: row !important;
      }
      .sidebar {
        position: relative !important;
        transform: translateX(0) !important;
        box-shadow: none !important;
      }
      .mobile-header {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}
