import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, ROUNDING } from '../../theme';
import { getApiClient } from '../../utils/api';
import useStore from '../../store/useStore';
import ServiceMap from '../../components/ServiceMap';
import ChatModal from '../../components/ChatModal';

const WorkerDashboard = ({ navigation }) => {
  const { getToken, signOut } = useAuth();
  const { user, setRole, logout, updateUserFields } = useStore();
  const insets = useSafeAreaInsets();
  
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [loadingActive, setLoadingActive] = useState(true);
  
  // Dispatch offer modal state
  const [countdown, setCountdown] = useState(30);
  const [chatOpen, setChatOpen] = useState(false);
  const [updatingBooking, setUpdatingBooking] = useState(false);
  
  const pollIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Fetch active booking
  const checkActiveBooking = async (showLoader = false) => {
    if (showLoader) setLoadingActive(true);
    try {
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.get('/bookings/active');
      
      const newBooking = response.data;
      setActiveBooking(newBooking);

      // Start countdown timer if there is an incoming dispatch finding provider
      if (newBooking && newBooking.status === 'finding_provider') {
        if (!countdownIntervalRef.current) {
          setCountdown(30);
          countdownIntervalRef.current = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                // Time's up! Auto-decline
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
                handleDecline(newBooking._id);
                return 30;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } else {
        // Clear countdown if not in finding_provider status
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    } catch (err) {
      console.error('Failed to fetch active booking:', err.message);
    } finally {
      if (showLoader) setLoadingActive(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    checkActiveBooking(true);
    
    // Polling active booking state every 3 seconds
    pollIntervalRef.current = setInterval(() => {
      checkActiveBooking(false);
    }, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Online / Offline toggle
  const handleStatusToggle = async (val) => {
    setUpdatingStatus(true);
    try {
      const nextStatus = val ? 'online' : 'offline';
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.put('/auth/profile', { status: nextStatus });
      updateUserFields({ status: response.data.status });
    } catch (err) {
      console.error('Failed to update duty availability status:', err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Decline Booking Offer
  const handleDecline = async (bookingId) => {
    setUpdatingBooking(true);
    try {
      const token = await getToken();
      const client = getApiClient(token);
      await client.put(`/bookings/${bookingId}/status`, { status: 'declined' });
      setActiveBooking(null);
    } catch (err) {
      console.error('Failed to decline booking:', err.message);
    } finally {
      setUpdatingBooking(false);
    }
  };

  // Accept Booking Offer
  const handleAccept = async (bookingId) => {
    setUpdatingBooking(true);
    try {
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.put(`/bookings/${bookingId}/status`, { status: 'accepted' });
      setActiveBooking(response.data);
    } catch (err) {
      console.error('Failed to accept booking:', err.message);
    } finally {
      setUpdatingBooking(false);
    }
  };

  // progressive state transitions
  const handleProgressJob = async () => {
    if (!activeBooking) return;
    setUpdatingBooking(true);

    let nextStatus = 'accepted';
    if (activeBooking.status === 'accepted') nextStatus = 'arrived';
    else if (activeBooking.status === 'arrived') nextStatus = 'in_progress';
    else if (activeBooking.status === 'in_progress') nextStatus = 'completed';

    try {
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.put(`/bookings/${activeBooking._id}/status`, { status: nextStatus });
      setActiveBooking(response.data);
      if (nextStatus === 'completed') {
        Alert.alert('Job Completed!', 'You have successfully completed this task. Excellent work!', [{ text: 'OK' }]);
      }
    } catch (err) {
      console.error('Failed to progress job status:', err.message);
    } finally {
      setUpdatingBooking(false);
    }
  };

  const handleRoleSwitch = async () => {
    try {
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.post('/auth/role', { role: 'customer' });
      setRole(response.data.role);
      useStore.getState().setUser(response.data);
    } catch (error) {
      console.error('Role switch failed:', error.message);
    }
  };

  const handleLogout = async () => {
    await signOut();
    logout();
  };

  const isOnline = user?.status === 'online';

  if (loadingActive) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.loadingText}>Loading Worker Panel...</Text>
      </View>
    );
  }

  // CASE 1: Active Job Routing Console
  if (activeBooking && ['accepted', 'arrived', 'in_progress'].includes(activeBooking.status)) {
    const customer = activeBooking.customer;

    return (
      <View style={styles.container}>
        {/* Dynamic Route Header */}
        <View style={[styles.activeHeader, { paddingTop: Math.max(insets.top, 16) }]}>
          <Text style={styles.activeHeaderTitle}>
            {activeBooking.status === 'accepted' && 'Navigating to Customer'}
            {activeBooking.status === 'arrived' && 'Arrived at Customer address'}
            {activeBooking.status === 'in_progress' && 'Service in Progress'}
          </Text>
          <Text style={styles.activeHeaderSub}>{activeBooking.pickupAddress}</Text>
        </View>

        {/* Dynamic Navigation Tracker Map */}
        <View style={styles.mapWrapper}>
          <ServiceMap 
            customerCoords={activeBooking.customerCoords}
            workerCoords={activeBooking.workerCoords}
            status={activeBooking.status}
          />
        </View>

        {/* Bottom Panel Drawer */}
        <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
          <View style={styles.customerBrief}>
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{customer?.name}</Text>
              <Text style={styles.customerPhone}>{customer?.phone || 'No phone number'}</Text>
              <Text style={styles.notesBrief} numberOfLines={2}>Notes: "{activeBooking.notes || 'None'}"</Text>
            </View>
            <View style={styles.priceBrief}>
              <Text style={styles.priceVal}>${activeBooking.price}</Text>
              <Text style={styles.priceLabel}>Earnings</Text>
            </View>
          </View>

          {/* Chat Button & Status progressions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.chatIconBtn} onPress={() => setChatOpen(true)}>
              <Text style={styles.chatIcon}>💬</Text>
              <Text style={styles.chatText}>Chat Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.progressionBtn,
                activeBooking.status === 'accepted' && styles.progressBtnAccepted,
                activeBooking.status === 'arrived' && styles.progressBtnArrived,
                activeBooking.status === 'in_progress' && styles.progressBtnProgress,
              ]}
              onPress={handleProgressJob}
              disabled={updatingBooking}
            >
              {updatingBooking ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.progressionBtnText}>
                  {activeBooking.status === 'accepted' && 'MARK AS ARRIVED'}
                  {activeBooking.status === 'arrived' && 'START SERVICE'}
                  {activeBooking.status === 'in_progress' && 'COMPLETE SERVICE'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* In-app chat modal */}
        <ChatModal 
          visible={chatOpen}
          onClose={() => setChatOpen(false)}
          bookingId={activeBooking._id}
          partnerName={customer?.name || 'Customer'}
          partnerAvatar={customer?.avatar}
        />
      </View>
    );
  }

  // CASE 2: Standby Duty listening (Offline/Online Dashboard)
  return (
    <View style={styles.container}>
      {/* Standby Header */}
      <View style={[styles.dashboardHeader, { paddingTop: Math.max(insets.top, 16) }]}>
        <View>
          <Text style={styles.greetingText}>Worker Portal</Text>
          <Text style={styles.greetingSub}>{user?.workerDetails?.category || 'General'} Partner</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.roleSwitchBtn} onPress={handleRoleSwitch}>
            <Text style={styles.roleSwitchText}>Hire Help</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Online Toggle Card */}
      <View style={styles.standbyMain}>
        <View style={[styles.statusCard, isOnline && styles.statusCardOnline]}>
          <View style={styles.statusDetails}>
            <Text style={styles.statusTitle}>Duty Status</Text>
            <Text style={styles.statusSub}>
              {isOnline ? 'You are ONLINE and receiving requests' : 'You are OFFLINE and hidden from maps'}
            </Text>
          </View>
          <View style={styles.switchCol}>
            {updatingStatus && <ActivityIndicator color={COLORS.primary} style={{ marginRight: 8 }} />}
            <Switch
              value={isOnline}
              onValueChange={handleStatusToggle}
              trackColor={{ false: '#cbd5e1', true: COLORS.primaryLight }}
              thumbColor={isOnline ? COLORS.primary : '#94a3b8'}
              disabled={updatingStatus}
            />
          </View>
        </View>

        {/* Listen status animation panel */}
        {isOnline ? (
          <View style={styles.listeningAnimationContainer}>
            <View style={styles.listeningCircle} />
            <View style={[styles.listeningCircle, styles.pulse1]} />
            <View style={[styles.listeningCircle, styles.pulse2]} />
            <Text style={styles.listeningStatusText}>Listening for instant dispatch requests...</Text>
          </View>
        ) : (
          <View style={styles.listeningAnimationContainer}>
            <Text style={[styles.listeningStatusText, { color: COLORS.textMuted }]}>Toggle online availability above to accept nearby service bookings.</Text>
          </View>
        )}
      </View>

      {/* CASE 3: Flashing Offer Overlay Modal */}
      {activeBooking && activeBooking.status === 'finding_provider' && (
        <Modal transparent visible animationType="fade">
          <View style={styles.modalBg}>
            <View style={styles.offerCard}>
              <View style={styles.offerTimerContainer}>
                <Text style={styles.offerTimerVal}>{countdown}</Text>
                <Text style={styles.offerTimerLabel}>seconds left</Text>
              </View>

              <Text style={styles.offerCategory}>INCOMING {activeBooking.category.toUpperCase()} REQUEST</Text>
              <View style={styles.divider} />

              <View style={styles.offerDetailsRow}>
                <Text style={styles.offerDetailsLabel}>Pickup Location</Text>
                <Text style={styles.offerDetailsVal} numberOfLines={2}>{activeBooking.pickupAddress}</Text>
              </View>

              <View style={styles.offerDetailsRow}>
                <Text style={styles.offerDetailsLabel}>Customer</Text>
                <Text style={styles.offerDetailsVal}>{activeBooking.customer?.name || 'Home Owner'}</Text>
              </View>

              <View style={styles.offerDetailsRow}>
                <Text style={styles.offerDetailsLabel}>Earnings</Text>
                <Text style={[styles.offerDetailsVal, styles.earningsVal]}>${activeBooking.price}</Text>
              </View>

              {activeBooking.notes ? (
                <View style={styles.offerNotesBox}>
                  <Text style={styles.offerNotesLabel}>Customer Instructions:</Text>
                  <Text style={styles.offerNotesText}>"{activeBooking.notes}"</Text>
                </View>
              ) : null}

              <View style={styles.offerActions}>
                <TouchableOpacity 
                  style={[styles.offerBtn, styles.declineBtn]}
                  onPress={() => handleDecline(activeBooking._id)}
                  disabled={updatingBooking}
                >
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.offerBtn, styles.acceptBtn]}
                  onPress={() => handleAccept(activeBooking._id)}
                  disabled={updatingBooking}
                >
                  {updatingBooking ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.acceptBtnText}>ACCEPT JOB</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    marginTop: SPACING.md,
  },
  activeHeader: {
    backgroundColor: COLORS.secondary,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomLeftRadius: ROUNDING.md,
    borderBottomRightRadius: ROUNDING.md,
  },
  activeHeaderTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  activeHeaderSub: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  mapWrapper: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: ROUNDING.lg,
    borderTopRightRadius: ROUNDING.lg,
    padding: SPACING.md,
    ...COLORS.cardShadow,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  customerBrief: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  customerPhone: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  notesBrief: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  priceBrief: {
    alignItems: 'flex-end',
  },
  priceVal: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.primaryDark,
  },
  priceLabel: {
    fontSize: 9,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  chatIconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    width: 80,
  },
  chatIcon: {
    fontSize: 22,
    backgroundColor: '#f1f5f9',
    width: 44,
    height: 44,
    borderRadius: 22,
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 4,
  },
  chatText: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.secondary,
  },
  progressionBtn: {
    flex: 1,
    height: 48,
    borderRadius: ROUNDING.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...COLORS.glassShadow,
  },
  progressBtnAccepted: {
    backgroundColor: '#f59e0b', // Amber Gold for Heading Over
  },
  progressBtnArrived: {
    backgroundColor: COLORS.primary, // Green to Start Service
  },
  progressBtnProgress: {
    backgroundColor: '#3b82f6', // Blue to Complete Service
  },
  progressionBtnText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.secondary,
  },
  greetingText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#fff',
  },
  greetingSub: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.primaryLight,
    opacity: 0.8,
  },
  roleSwitchBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: ROUNDING.sm,
    marginRight: 6,
  },
  roleSwitchText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: ROUNDING.sm,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  standbyMain: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statusCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: ROUNDING.md,
    padding: SPACING.md,
    alignItems: 'center',
    width: '100%',
    ...COLORS.cardShadow,
    borderLeftWidth: 5,
    borderLeftColor: '#94a3b8',
  },
  statusCardOnline: {
    borderLeftColor: COLORS.primary,
    backgroundColor: '#f0fdf4',
  },
  statusDetails: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  statusSub: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  switchCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listeningAnimationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    width: '100%',
  },
  listeningCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  pulse1: {
    transform: [{ scale: 1.8 }],
    opacity: 0.3,
  },
  pulse2: {
    transform: [{ scale: 2.6 }],
    opacity: 0.1,
  },
  listeningStatusText: {
    marginTop: 130,
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.primaryDark,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 18,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: ROUNDING.md,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...COLORS.cardShadow,
  },
  offerTimerContainer: {
    backgroundColor: COLORS.secondary,
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  offerTimerVal: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  offerTimerLabel: {
    fontSize: 7,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  offerCategory: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: '100%',
    marginVertical: SPACING.sm,
  },
  offerDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  offerDetailsLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  offerDetailsVal: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    maxWidth: '65%',
    textAlign: 'right',
  },
  earningsVal: {
    color: COLORS.primaryDark,
    fontSize: 16,
  },
  offerNotesBox: {
    backgroundColor: '#f8fafc',
    borderRadius: ROUNDING.sm,
    padding: 8,
    width: '100%',
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  offerNotesLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
  },
  offerNotesText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textDark,
    marginTop: 2,
    fontStyle: 'italic',
  },
  offerActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  offerBtn: {
    flex: 1,
    height: 44,
    borderRadius: ROUNDING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: {
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fff',
    marginRight: 6,
  },
  declineBtnText: {
    color: '#ef4444',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  acceptBtn: {
    backgroundColor: COLORS.primary,
    marginLeft: 6,
    ...COLORS.glassShadow,
  },
  acceptBtnText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});

export default WorkerDashboard;
