import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, 
  SafeAreaView, StatusBar, Image, Alert, ActivityIndicator 
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import api from './src/services/api';

const AVATARS = [
  'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
];

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Gardening', 'Repair'];

function MobileWorkerAppContent() {
  const { user, login, register, logout, onboard, refreshUserData } = useAuth();
  
  // Navigation State: 'auth' | 'pending' | 'onboard' | 'home' | 'job' | 'earnings'
  const [currentScreen, setCurrentScreen] = useState('auth');
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState('');
  
  // Auth Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Onboarding Form
  const [specialty, setSpecialty] = useState(CATEGORIES[0]);
  const [hourlyRate, setHourlyRate] = useState(150);
  const [experience, setExperience] = useState(3);
  const [bio, setBio] = useState('');
  const [govId, setGovId] = useState('');
  const [cert, setCert] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  // Home & Jobs State
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  // Chat message
  const [chatText, setChatText] = useState('');

  // Check login and onboarding status
  useEffect(() => {
    if (user) {
      if (!user.onboardingCompleted) {
        setCurrentScreen('onboard');
      } else if (user.status !== 'APPROVED') {
        setCurrentScreen('pending');
      } else {
        setCurrentScreen('home');
        fetchBookings();
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
    setEmail('plumber@fixconnect.com');
    setPassword('workerpass123');
    setIsLogin(true);
    setAuthError('');
    try {
      await login('plumber@fixconnect.com', 'workerpass123');
    } catch (err) {
      // Auto register fallback
      try {
        await register('Mario Plumber', 'plumber@fixconnect.com', '09987654321', 'workerpass123');
      } catch (regErr) {
        setAuthError('Failed to login or register seed account.');
      }
    }
  };

  const handleOnboardSubmit = async () => {
    if (!bio || !govId) {
      Alert.alert('Error', 'Biography and Government ID verification details are required.');
      return;
    }
    setLoading(true);
    try {
      await onboard({
        specialty,
        hourlyRate: Number(hourlyRate),
        experienceYears: Number(experience),
        bio,
        governmentId: govId,
        certificate: cert || undefined,
        avatar,
      });
      setCurrentScreen('pending');
    } catch (err) {
      Alert.alert('Onboarding Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDecline = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      await fetchBookings();
      if (selectedBooking && selectedBooking._id === id) {
        const response = await api.get(`/bookings/${id}`);
        setSelectedBooking(response.data.booking);
      }
    } catch (err) {
      Alert.alert('Update Failed', err.message);
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

  // ------------------------------------------
  // CALCULATIONS
  // ------------------------------------------
  const activeRequests = bookings.filter(b => b.status === 'PENDING');
  const activeProjects = bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS');
  const totalEarnings = bookings
    .filter(b => b.status === 'COMPLETED' && b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + b.price, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 1. AUTH SCREEN */}
      {currentScreen === 'auth' && (
        <ScrollView contentContainerStyle={styles.scrollAuth}>
          <Text style={styles.appTitle}>Fix-Connect</Text>
          <Text style={styles.appSubtitle}>Handyman Partner Mobile App</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{isLogin ? 'Partner Login' : 'Create Partner Account'}</Text>
            
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
                {isLogin ? "Don't have a partner account? Sign Up" : 'Already registered? Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnDemo} onPress={handleQuickDemo}>
              <Text style={styles.btnDemoText}>Use Quick Demo Worker Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* 2. ONBOARDING SCREEN */}
      {currentScreen === 'onboard' && (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.screenTitle}>Setup Worker Profile</Text>
          <Text style={styles.screenDesc}>Provide details to start receiving bookings</Text>

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

            <Text style={styles.label}>Specialty Category</Text>
            <View style={styles.selectWrapper}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Plumbing, Electrical, Cleaning"
                value={specialty}
                onChangeText={setSpecialty}
              />
            </View>

            <View style={styles.grid2}>
              <View style={styles.col}>
                <Text style={styles.label}>Hourly Rate (PHP)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="PHP/hr"
                  value={String(hourlyRate)}
                  onChangeText={(val) => setHourlyRate(parseInt(val) || 0)}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Years of Experience</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Years"
                  value={String(experience)}
                  onChangeText={(val) => setExperience(parseInt(val) || 0)}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Text style={styles.label}>License / Gov ID Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter valid ID for verifications"
              value={govId}
              onChangeText={setGovId}
            />

            <Text style={styles.label}>Biography / Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell clients about your specialty skills..."
              value={bio}
              onChangeText={setBio}
              multiline
            />

            <TouchableOpacity style={styles.btnPrimary} onPress={handleOnboardSubmit} disabled={loading}>
              <Text style={styles.btnText}>{loading ? 'Submitting...' : 'Register Profile'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* 3. VERIFICATION PENDING SCREEN */}
      {currentScreen === 'pending' && (
        <View style={styles.centered}>
          <Text style={styles.titleLarge}>Profile Review Pending</Text>
          <Text style={styles.descMedium}>
            Our administration operators are reviewing your government ID card and specialties rates.
            You will receive access to client requests once approved.
          </Text>

          <TouchableOpacity style={styles.btnPrimary} onPress={refreshUserData}>
            <Text style={styles.btnText}>Check Status Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnCancel} onPress={logout}>
            <Text style={styles.btnCancelText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. WORKER JOBS SCREEN */}
      {currentScreen === 'home' && (
        <View style={styles.mainWrapper}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Handyman Portal</Text>
            <TouchableOpacity onPress={() => setCurrentScreen('earnings')} style={styles.subBtn}>
              <Text style={styles.subBtnText}>Balance</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.flexBody}>
            {/* Online Status Header */}
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>Availability: Active & Online</Text>
              <Text style={styles.statusRating}>Rating: {user?.rating?.toFixed(1) || '5.0'}★</Text>
            </View>

            {/* Inbound Booking Requests */}
            <Text style={styles.sectionTitle}>Inbound Requests ({activeRequests.length})</Text>
            {activeRequests.length === 0 ? (
              <Text style={styles.emptyText}>No pending job requests available.</Text>
            ) : (
              activeRequests.map((item) => (
                <View key={item._id} style={styles.bookingRequestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestClient}>{item.userId?.fullName}</Text>
                    <Text style={styles.requestPrice}>PHP {item.price}</Text>
                  </View>
                  <Text style={styles.requestDesc}>"{item.description}"</Text>
                  <Text style={styles.requestLoc}>{item.address}</Text>

                  <View style={styles.requestActions}>
                    <TouchableOpacity 
                      style={styles.actionDecline} 
                      onPress={() => handleAcceptDecline(item._id, 'DECLINED')}
                    >
                      <Text style={styles.btnCancelText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionAccept} 
                      onPress={() => handleAcceptDecline(item._id, 'ACCEPTED')}
                    >
                      <Text style={styles.btnText}>Accept Job</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {/* Active Projects */}
            <Text style={styles.sectionTitle}>Active Projects</Text>
            {activeProjects.length === 0 ? (
              <Text style={styles.emptyText}>No ongoing tasks. Accept requests above!</Text>
            ) : (
              activeProjects.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.activeCard}
                  onPress={() => {
                    setSelectedBooking(item);
                    setCurrentScreen('job');
                  }}
                >
                  <View style={styles.bookingHeader}>
                    <Text style={styles.activeClient}>{item.userId?.fullName}</Text>
                    <Text style={styles.activeStatusTag}>{item.status}</Text>
                  </View>
                  <Text style={styles.activeDetails}>{item.serviceType} &bull; PHP {item.price}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* 5. JOB DETAIL & CLIENT COORDINATION CHAT */}
      {currentScreen === 'job' && selectedBooking && (
        <View style={styles.mainWrapper}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>&larr; Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Job Sheet</Text>
          </View>

          <View style={styles.bookingDetailCard}>
            <Text style={styles.detailTitle}>Client: {selectedBooking.userId?.fullName}</Text>
            <Text style={styles.detailSpec}>Loc: {selectedBooking.userId?.address}</Text>
            <Text style={styles.detailPrice}>Scheduled: {new Date(selectedBooking.scheduledAt).toLocaleDateString()}</Text>

            {selectedBooking.status === 'ACCEPTED' && (
              <TouchableOpacity 
                style={styles.btnAccept} 
                onPress={() => handleAcceptDecline(selectedBooking._id, 'IN_PROGRESS')}
              >
                <Text style={styles.btnText}>Start Work (In Progress)</Text>
              </TouchableOpacity>
            )}

            {selectedBooking.status === 'IN_PROGRESS' && (
              <TouchableOpacity 
                style={styles.btnPay} 
                onPress={() => handleAcceptDecline(selectedBooking._id, 'COMPLETED')}
              >
                <Text style={styles.btnText}>Mark Complete & Send Invoice</Text>
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

      {/* 6. EARNINGS ANALYTICS VIEW */}
      {currentScreen === 'earnings' && (
        <View style={styles.mainWrapper}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>&larr; Jobs</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Earnings history</Text>
          </View>

          <View style={styles.earningsKpi}>
            <Text style={styles.kpiLabel}>Total Balance Earned</Text>
            <Text style={styles.kpiValue}>PHP {totalEarnings.toFixed(2)}</Text>
          </View>

          {/* Custom SVG/Grid Bar chart mockup */}
          <View style={styles.chartMock}>
            <Text style={styles.chartTitle}>Monthly Distributions</Text>
            <View style={styles.barContainer}>
              {['April', 'May', 'June'].map((month, i) => {
                const height = i === 2 ? 80 : i === 1 ? 50 : 30;
                return (
                  <View key={month} style={styles.barCol}>
                    <View style={[styles.bar, { height }]} />
                    <Text style={styles.barLabel}>{month}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Paid invoices roster */}
          <Text style={styles.sectionTitle}>Paid Invoices</Text>
          <ScrollView style={styles.flexBody}>
            {bookings.filter(b => b.status === 'COMPLETED' && b.paymentStatus === 'PAID').length === 0 ? (
              <Text style={styles.emptyText}>No completed earnings records yet.</Text>
            ) : (
              bookings
                .filter(b => b.status === 'COMPLETED' && b.paymentStatus === 'PAID')
                .map((b) => (
                  <View key={b._id} style={styles.invoiceCard}>
                    <View>
                      <Text style={styles.invoiceClient}>{b.userId?.fullName}</Text>
                      <Text style={styles.invoiceDate}>{b.serviceType} &bull; Paid</Text>
                    </View>
                    <Text style={styles.invoiceAmount}>+₱{b.price}</Text>
                  </View>
                ))
            )}
          </ScrollView>
        </View>
      )}

    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MobileWorkerAppContent />
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
  grid2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    width: '48%',
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  titleLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  descMedium: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 18,
  },
  btnCancel: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  btnCancelText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: 'bold',
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
  subBtn: {
    paddingHorizontal: 10,
  },
  subBtnText: {
    color: '#10b981',
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
  statusBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusRating: {
    color: '#fbbf24',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 13,
    marginVertical: 30,
  },
  bookingRequestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  requestClient: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  requestPrice: {
    fontSize: 13,
    fontWeight: 'black',
    color: '#10b981',
  },
  requestDesc: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  requestLoc: {
    fontSize: 10,
    color: '#94a3b8',
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionDecline: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 10,
  },
  actionAccept: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 8,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  activeClient: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  activeStatusTag: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  activeDetails: {
    fontSize: 11,
    color: '#94a3b8',
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
  btnAccept: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  btnPay: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 10,
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
  earningsKpi: {
    backgroundColor: '#10b981',
    padding: 20,
    alignItems: 'center',
  },
  kpiLabel: {
    color: '#dcfce7',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  kpiValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  chartMock: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    justifyContent: 'space-around',
    paddingTop: 10,
  },
  barCol: {
    alignItems: 'center',
  },
  bar: {
    width: 32,
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 6,
    fontWeight: 'bold',
  },
  invoiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  invoiceClient: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  invoiceDate: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  invoiceAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
});
