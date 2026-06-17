import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, 
  SafeAreaView, StatusBar, Image, Alert, ActivityIndicator 
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import api from './src/services/api';

// Simple mockup presets for images
const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
];

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Gardening', 'Repair'];

function MobileUserAppContent() {
  const { user, login, register, logout, onboard } = useAuth();
  
  // Navigation State: 'auth' | 'onboard' | 'home' | 'search' | 'booking'
  const [currentScreen, setCurrentScreen] = useState('auth');
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState('');
  
  // Auth Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Onboarding Form
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState([120.9842, 14.5995]); // Manila
  const [avatar, setAvatar] = useState(AVATARS[0]);

  // Home & Worker Search
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  // Booking Form
  const [bookingWorker, setBookingWorker] = useState(null);
  const [bookingDesc, setBookingDesc] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-06-20');
  const [bookingTime, setBookingTime] = useState('10:00');

  // Chat message
  const [chatText, setChatText] = useState('');

  // Check login state and onboarding completion
  useEffect(() => {
    if (user) {
      if (user.onboardingCompleted) {
        setCurrentScreen('home');
        fetchBookings();
      } else {
        setCurrentScreen('onboard');
      }
    } else {
      setCurrentScreen('auth');
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.bookings || []);
    } catch (err) {
      console.log('Failed to fetch bookings', err.message);
    }
  };

  const handleLoginRegister = async () => {
    setAuthError('');
    if (isLogin) {
      try {
        await login(email, password);
      } catch (err) {
        setAuthError(err);
      }
    } else {
      try {
        await register(fullName, email, phoneNumber, password);
      } catch (err) {
        setAuthError(err);
      }
    }
  };

  const handleQuickDemo = async () => {
    setEmail('client@fixconnect.com');
    setPassword('userpass123');
    setIsLogin(true);
    setAuthError('');
    try {
      await login('client@fixconnect.com', 'userpass123');
    } catch (err) {
      // Auto register fallback
      try {
        await register('Demo Client', 'client@fixconnect.com', '09123456789', 'userpass123');
      } catch (regErr) {
        setAuthError('Failed to login or register seed account.');
      }
    }
  };

  const handleOnboardSubmit = async () => {
    if (!address) {
      Alert.alert('Error', 'Please enter your service address');
      return;
    }
    setLoading(true);
    try {
      await onboard({ address, coordinates: coords, avatar });
      setCurrentScreen('home');
    } catch (err) {
      Alert.alert('Onboarding Failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = async (cat) => {
    setSelectedCategory(cat);
    setCurrentScreen('search');
    setLoading(true);
    try {
      const filters = { specialty: cat };
      if (user?.coordinates) {
        filters.lon = user.coordinates[0];
        filters.lat = user.coordinates[1];
      }
      // Simple fetch parameters
      const response = await api.get(`/users/workers?specialty=${cat}&lat=${user?.coordinates?.[1] || 14.5995}&lon=${user?.coordinates?.[0] || 120.9842}`);
      setWorkers(response.data.workers || []);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestBooking = async () => {
    if (!bookingDesc) {
      Alert.alert('Error', 'Please describe the job');
      return;
    }
    setLoading(true);
    try {
      const scheduledAt = new Date(`${bookingDate}T${bookingTime}`);
      await api.post('/bookings', {
        workerId: bookingWorker._id,
        serviceType: bookingWorker.specialty,
        description: bookingDesc,
        scheduledAt: scheduledAt.toISOString(),
        address: user.address,
        coordinates: user.coordinates,
      });
      setBookingWorker(null);
      setBookingDesc('');
      await fetchBookings();
      setCurrentScreen('home');
    } catch (err) {
      Alert.alert('Booking Request Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatText.trim()) return;
    try {
      const response = await api.post(`/bookings/${selectedBooking._id}/chat`, { text: chatText });
      setSelectedBooking({ ...selectedBooking, chat: response.data.chat });
      setChatText('');
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleMockPaymongo = async () => {
    try {
      await api.post('/payments/confirm', {
        bookingId: selectedBooking._id,
        paymentMethod: 'GCash',
        paymentId: `rn_pm_${Math.random().toString(36).substr(2, 9)}`,
      });
      const response = await api.get(`/bookings/${selectedBooking._id}`);
      setSelectedBooking(response.data.booking);
      fetchBookings();
      Alert.alert('Success', 'GCash Sandbox Payment completed!');
    } catch (err) {
      Alert.alert('Payment Failed', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Resolving */}

      {/* 1. AUTH SCREEN */}
      {currentScreen === 'auth' && (
        <ScrollView contentContainerStyle={styles.scrollAuth}>
          <Text style={styles.appTitle}>Fix-Connect</Text>
          <Text style={styles.appSubtitle}>Client Mobile Application</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
            
            {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

            {!isLogin && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </>
            )}

            <TextInput
              style={styles.input}
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.btnPrimary} onPress={handleLoginRegister}>
              <Text style={styles.btnText}>{isLogin ? 'Login' : 'Create Account'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnLink} onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.btnLinkText}>
                {isLogin ? "Don't have an account? Sign Up" : 'Already registered? Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnDemo} onPress={handleQuickDemo}>
              <Text style={styles.btnDemoText}>Use Quick Demo Client Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* 2. ONBOARDING SCREEN */}
      {currentScreen === 'onboard' && (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.screenTitle}>Setup Service Location</Text>
          <Text style={styles.screenDesc}>Provide details to start booking local workers</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Select Profile Photo</Text>
            <View style={styles.avatarRow}>
              {AVATARS.map((item) => (
                <TouchableOpacity 
                  key={item} 
                  onPress={() => setAvatar(item)}
                  style={[styles.avatarBtn, avatar === item && styles.selectedAvatar]}
                >
                  <Image source={{ uri: item }} style={styles.avatarImg} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Service Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Taft Avenue, Manila City"
              value={address}
              onChangeText={setAddress}
            />

            <TouchableOpacity style={styles.btnPrimary} onPress={handleOnboardSubmit} disabled={loading}>
              <Text style={styles.btnText}>{loading ? 'Completing...' : 'Finish Setup'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* 3. HOME SCREEN */}
      {currentScreen === 'home' && (
        <View style={styles.mainWrapper}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Fix-Connect Client</Text>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.flexBody}>
            {/* Category Grid */}
            <Text style={styles.sectionTitle}>I need help with...</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  style={styles.categoryCard} 
                  onPress={() => handleSelectCategory(cat)}
                >
                  <Text style={styles.categoryCardText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bookings Queue */}
            <Text style={styles.sectionTitle}>Active Bookings</Text>
            {bookings.length === 0 ? (
              <Text style={styles.emptyText}>No active bookings. Tap a service to find workers!</Text>
            ) : (
              bookings.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.bookingCard}
                  onPress={() => {
                    setSelectedBooking(item);
                    setCurrentScreen('booking');
                  }}
                >
                  <View style={styles.bookingHeader}>
                    <Text style={styles.bookingWorkerName}>{item.workerId?.fullName || 'Worker'}</Text>
                    <Text style={styles.bookingStatus}>{item.status}</Text>
                  </View>
                  <Text style={styles.bookingDetails}>{item.serviceType} &bull; PHP {item.price}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* 4. WORKER SEARCH & BOOK */}
      {currentScreen === 'search' && (
        <View style={styles.mainWrapper}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>&larr; Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{selectedCategory} Workers</Text>
          </View>

          {loading ? (
            <ActivityIndicator style={styles.loader} size="large" color="#10b981" />
          ) : workers.length === 0 ? (
            <Text style={styles.emptyText}>No available workers in this category.</Text>
          ) : (
            <ScrollView style={styles.flexBody}>
              {workers.map((worker) => (
                <View key={worker._id} style={styles.workerCard}>
                  <View style={styles.workerInfo}>
                    <Image source={{ uri: worker.avatar || AVATARS[0] }} style={styles.workerAvatar} />
                    <View style={styles.workerText}>
                      <Text style={styles.workerName}>{worker.fullName}</Text>
                      <Text style={styles.workerSpec}>{worker.specialty} &bull; ₱{worker.hourlyRate}/hr</Text>
                      <Text style={styles.workerRating}>Rating: {worker.rating?.toFixed(1) || '5.0'} ({worker.ratingsCount || 0} reviews)</Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.btnPrimarySm} 
                    onPress={() => setBookingWorker(worker)}
                  >
                    <Text style={styles.btnText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Booking Request Modal Overlay Mock */}
          {bookingWorker && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Book {bookingWorker.fullName}</Text>
                
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your handyman job details..."
                  value={bookingDesc}
                  onChangeText={setBookingDesc}
                  multiline
                />

                <TouchableOpacity style={styles.btnPrimary} onPress={handleRequestBooking}>
                  <Text style={styles.btnText}>Submit Booking Request</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnCancel} onPress={() => setBookingWorker(null)}>
                  <Text style={styles.btnCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* 5. BOOKING DETAIL & CHAT */}
      {currentScreen === 'booking' && selectedBooking && (
        <View style={styles.mainWrapper}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>&larr; Jobs</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Job Management</Text>
          </View>

          <View style={styles.bookingDetailCard}>
            <Text style={styles.detailTitle}>Provider: {selectedBooking.workerId?.fullName}</Text>
            <Text style={styles.detailSpec}>Service: {selectedBooking.serviceType} ({selectedBooking.status})</Text>
            <Text style={styles.detailPrice}>Invoice: PHP {selectedBooking.price} &bull; Payment: {selectedBooking.paymentStatus}</Text>

            {selectedBooking.status === 'COMPLETED' && selectedBooking.paymentStatus === 'UNPAID' && (
              <TouchableOpacity style={styles.btnPay} onPress={handleMockPaymongo}>
                <Text style={styles.btnText}>Pay via Paymongo (GCash Sandbox)</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Chat Messages */}
          <Text style={styles.chatTitle}>Job Chat</Text>
          <ScrollView style={styles.chatScrollView}>
            {selectedBooking.chat && selectedBooking.chat.length === 0 ? (
              <Text style={styles.noChatText}>No messages. Write below to coordinate.</Text>
            ) : (
              selectedBooking.chat?.map((msg, index) => (
                <View key={index} style={[styles.chatBubble, msg.senderId === user.id && styles.chatBubbleRight]}>
                  <Text style={[styles.chatText, msg.senderId === user.id && styles.chatTextRight]}>{msg.text}</Text>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Send message..."
              value={chatText}
              onChangeText={setChatText}
            />
            <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendChat}>
              <Text style={styles.chatSendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MobileUserAppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollAuth: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  scroll: {
    padding: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 20,
    textAlign: 'center',
  },
  screenDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
    color: '#334155',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  btnPrimarySm: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  btnLink: {
    marginTop: 14,
    alignItems: 'center',
  },
  btnLinkText: {
    fontSize: 12,
    color: '#f97316',
    fontWeight: '600',
  },
  btnDemo: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnDemoText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  avatarBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatar: {
    borderColor: '#10b981',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  mainWrapper: {
    flex: 1,
  },
  header: {
    height: 56,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutBtnText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: 'bold',
  },
  backBtn: {
    paddingVertical: 6,
  },
  backBtnText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: 'bold',
  },
  flexBody: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 1,
  },
  categoryCardText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 13,
    marginVertical: 40,
    paddingHorizontal: 20,
  },
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bookingWorkerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  bookingStatus: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  bookingDetails: {
    fontSize: 11,
    color: '#94a3b8',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  workerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  workerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  workerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  workerText: {
    flex: 1,
  },
  workerName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  workerSpec: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  workerRating: {
    fontSize: 10,
    color: '#f59e0b',
    fontWeight: '600',
    marginTop: 2,
  },
  modalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20,
    zIndex: 100,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  btnCancel: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  btnCancelText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: 'bold',
  },
  bookingDetailCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  detailSpec: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  detailPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
    marginTop: 4,
  },
  btnPay: {
    backgroundColor: '#ea580c',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  chatTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    textTransform: 'uppercase',
  },
  chatScrollView: {
    flex: 1,
    padding: 12,
  },
  noChatText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 30,
  },
  chatBubble: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 12,
    borderBottomLeftRadius: 0,
    maxWidth: '80%',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  chatBubbleRight: {
    backgroundColor: '#10b981',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 0,
    alignSelf: 'flex-end',
  },
  chatText: {
    fontSize: 13,
    color: '#334155',
  },
  chatTextRight: {
    color: '#ffffff',
  },
  chatInputRow: {
    height: 56,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    marginRight: 10,
  },
  chatSendBtn: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chatSendBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
