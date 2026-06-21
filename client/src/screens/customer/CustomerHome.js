import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, ROUNDING } from '../../theme';
import { getApiClient } from '../../utils/api';
import useStore from '../../store/useStore';
import ServiceMap from '../../components/ServiceMap';
import RadarLoader from '../../components/RadarLoader';
import ChatModal from '../../components/ChatModal';

const CATEGORIES = [
  { id: '1', name: 'Plumbing', icon: '🚰', desc: 'Leaks, unclogging & pipe repairs' },
  { id: '2', name: 'Electrical', icon: '⚡', desc: 'Wiring, fixtures & power faults' },
  { id: '3', name: 'Cleaning', icon: '🧹', desc: 'Deep cleaning & sanitization' },
  { id: '4', name: 'AC Repair', icon: '❄️', desc: 'Filter clean & cooling issues' },
  { id: '5', name: 'Carpentry', icon: '🪚', desc: 'Furniture assembly & wood work' },
  { id: '6', name: 'Painting', icon: '🎨', desc: 'Walls, cabinets & touch-ups' },
];

const CustomerHome = ({ navigation }) => {
  const { getToken, signOut } = useAuth();
  const { user, setRole, logout } = useStore();
  const insets = useSafeAreaInsets();
  
  // Active Booking state
  const [activeBooking, setActiveBooking] = useState(null);
  const [loadingActive, setLoadingActive] = useState(true);
  
  // Selection/Booking flow states
  const [selectedCategory, setSelectedCategory] = useState('Plumbing');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('123 Taft Ave, Manila, Metro Manila');
  const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  
  // Chat & Review state
  const [chatOpen, setChatOpen] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  
  const pollIntervalRef = useRef(null);

  // Fetch active booking
  const checkActiveBooking = async (showLoader = false) => {
    if (showLoader) setLoadingActive(true);
    try {
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.get('/bookings/active');
      setActiveBooking(response.data);
    } catch (err) {
      console.error('Failed to fetch active booking:', err.message);
    } finally {
      if (showLoader) setLoadingActive(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    checkActiveBooking(true);
    
    // Set up polling every 3 seconds to get live coordinates & state changes
    pollIntervalRef.current = setInterval(() => {
      checkActiveBooking(false);
    }, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    logout();
  };

  const handleRoleSwitch = async () => {
    try {
      const token = await getToken();
      const client = getApiClient(token);
      const updatedRole = user.role === 'customer' ? 'worker' : 'customer';
      const response = await client.post('/auth/role', { role: updatedRole });
      setRole(response.data.role);
      useStore.getState().setUser(response.data);
    } catch (error) {
      console.error('Failed to switch role:', error.message);
    }
  };

  // Launch instant dispatch matching
  const handleInstantBook = async () => {
    setRequesting(true);
    try {
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.post('/bookings/instant', {
        category: selectedCategory,
        latitude: 14.5995, // Manila coordinates simulated
        longitude: 120.9842,
        notes,
        address
      });
      setActiveBooking(response.data);
      setBookingDetailsOpen(false);
      setNotes('');
    } catch (err) {
      Alert.alert(
        'No Partners Nearby',
        err.response?.data?.message || 'Failed to dispatch service request. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setRequesting(false);
    }
  };

  // Cancel request
  const handleCancelBooking = async () => {
    if (!activeBooking) return;
    
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking request?',
      [
        { text: 'Keep Booking', style: 'cancel' },
        { 
          text: 'Cancel Job', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              const client = getApiClient(token);
              await client.put(`/bookings/${activeBooking._id}/status`, { status: 'cancelled' });
              setActiveBooking(null);
            } catch (err) {
              console.error('Failed to cancel booking:', err.message);
            }
          }
        }
      ]
    );
  };

  // Submit worker review
  const handleSubmitReview = () => {
    // Simulated rating save
    Alert.alert('Review Submitted', 'Thank you for your rating & feedback!', [
      { 
        text: 'Done', 
        onPress: () => {
          setShowReviewModal(false);
          setActiveBooking(null);
        } 
      }
    ]);
  };

  if (loadingActive) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.loadingText}>Loading FixConnect Live...</Text>
      </View>
    );
  }

  // CASE 1: Searching for professional (Radar view)
  if (activeBooking && activeBooking.status === 'finding_provider') {
    return (
      <RadarLoader 
        category={activeBooking.category} 
        onCancel={handleCancelBooking} 
      />
    );
  }

  // CASE 2: Active tracking view (Map & dispatch dashboard)
  if (activeBooking && ['accepted', 'arrived', 'in_progress', 'completed'].includes(activeBooking.status)) {
    
    // Automatically trigger review overlay if booking transitions to completed
    if (activeBooking.status === 'completed' && !showReviewModal) {
      setShowReviewModal(true);
    }

    const worker = activeBooking.worker;

    return (
      <View style={styles.container}>
        {/* Dynamic Header */}
        <View style={[styles.activeHeader, { paddingTop: Math.max(insets.top, 16) }]}>
          <Text style={styles.activeHeaderTitle}>
            {activeBooking.status === 'accepted' && 'Worker heading to you'}
            {activeBooking.status === 'arrived' && 'Worker arrived at location'}
            {activeBooking.status === 'in_progress' && 'Service in progress'}
            {activeBooking.status === 'completed' && 'Service Completed'}
          </Text>
          <Text style={styles.activeHeaderSub}>{activeBooking.pickupAddress}</Text>
        </View>

        {/* Live Route Map */}
        <View style={styles.mapWrapper}>
          <ServiceMap 
            customerCoords={activeBooking.customerCoords}
            workerCoords={activeBooking.workerCoords}
            status={activeBooking.status}
          />
        </View>

        {/* Bottom Details Drawer */}
        <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
          <View style={styles.workerBrief}>
            <Image 
              source={{ uri: worker?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(worker?.name || 'Worker') }} 
              style={styles.workerAvatar} 
            />
            <View style={styles.workerDetails}>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingStar}>★</Text>
                <Text style={styles.ratingNum}>{worker?.workerDetails?.rating?.toFixed(1) || '5.0'}</Text>
              </View>
              <Text style={styles.workerName}>{worker?.name}</Text>
              <Text style={styles.workerCategory}>{activeBooking.category} Professional</Text>
            </View>
            <View style={styles.priceBrief}>
              <Text style={styles.priceBriefVal}>${activeBooking.price}</Text>
              <Text style={styles.priceBriefLabel}>Fixed Price</Text>
            </View>
          </View>

          {/* Action Triggers */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionCircleBtn} onPress={() => setChatOpen(true)}>
              <Text style={styles.actionEmoji}>💬</Text>
              <Text style={styles.actionLabel}>Chat Partner</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCircleBtn, styles.cancelCircleBtn]} 
              onPress={handleCancelBooking}
              disabled={activeBooking.status === 'in_progress'}
            >
              <Text style={[styles.actionEmoji, activeBooking.status === 'in_progress' && { opacity: 0.5 }]}>❌</Text>
              <Text style={[styles.actionLabel, activeBooking.status === 'in_progress' && { color: COLORS.textMuted }]}>Cancel Job</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messaging Chat Sheet */}
        <ChatModal 
          visible={chatOpen} 
          onClose={() => setChatOpen(false)}
          bookingId={activeBooking._id}
          partnerName={worker?.name || 'Partner'}
          partnerAvatar={worker?.avatar}
        />

        {/* Star Rating Dialog */}
        <Modal visible={showReviewModal} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewTitle}>Rate Service Partner</Text>
              <Text style={styles.reviewSub}>How did {worker?.name} perform on this job?</Text>

              {/* Stars Grid */}
              <View style={styles.starsGrid}>
                {[1, 2, 3, 4, 5].map(num => (
                  <TouchableOpacity key={`star-${num}`} onPress={() => setRating(num)}>
                    <Text style={[styles.reviewStar, rating >= num ? styles.starYellow : styles.starGrey]}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput 
                style={styles.reviewTextarea} 
                placeholder="Leave details about experience (optional)..." 
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity style={styles.submitReviewBtn} onPress={handleSubmitReview}>
                <Text style={styles.submitReviewText}>Submit & Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // CASE 3: Standard Dashboard (No Active Bookings)
  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.dashboardHeader, { paddingTop: Math.max(insets.top, 16) }]}>
        <View>
          <Text style={styles.greetingText}>Hello, {user?.name || 'Customer'}</Text>
          <Text style={styles.greetingSub}>Let's book a service provider</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.roleSwitchBtn} onPress={handleRoleSwitch}>
            <Text style={styles.roleSwitchText}>Become Worker</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Viewport Map Picker */}
      <View style={styles.mapContainer}>
        <ServiceMap 
          customerCoords={[120.9842, 14.5995]}
          workerCoords={[120.9890, 14.6010]}
          status="finding_provider"
        />

        {/* Floating Pin overlay mockup */}
        <View style={styles.mapPin}>
          <View style={styles.pinDot} />
          <View style={styles.pinPulse} />
        </View>

        {/* Floating Address Bar */}
        <View style={styles.addressBar}>
          <Text style={styles.addressMarker}>📍</Text>
          <TextInput 
            style={styles.addressInput}
            value={address}
            onChangeText={setAddress}
            placeholder="Search address..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>

      {/* Bottom Dispatch Sheet */}
      <View style={[styles.bottomDashboardSheet, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
        <Text style={styles.categoryTitle}>Choose Service Category</Text>
        
        {/* Horizontal Category slider */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categorySlider}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat.id} 
              style={[
                styles.categoryCard, 
                selectedCategory === cat.name && styles.categoryCardActive
              ]}
              onPress={() => setSelectedCategory(cat.name)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[
                styles.categoryName, 
                selectedCategory === cat.name && styles.categoryNameActive
              ]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={styles.bookNowBtn} 
          onPress={() => setBookingDetailsOpen(true)}
        >
          <Text style={styles.bookNowBtnText}>Instant Book: {selectedCategory}</Text>
        </TouchableOpacity>
      </View>

      {/* Request Details Overlay Sheet */}
      {bookingDetailsOpen && (
        <View style={styles.modalBackdrop}>
          <View style={[styles.dispatchDetailsCard, { paddingBottom: Math.max(insets.bottom, SPACING.lg) }]}>
            <Text style={styles.dispatchTitle}>Confirm Service Booking</Text>
            
            <View style={styles.dispatchItemRow}>
              <Text style={styles.dispatchLabel}>Category</Text>
              <Text style={styles.dispatchVal}>{selectedCategory}</Text>
            </View>

            <View style={styles.dispatchItemRow}>
              <Text style={styles.dispatchLabel}>Pickup Location</Text>
              <Text style={styles.dispatchVal} numberOfLines={2}>{address}</Text>
            </View>

            <View style={styles.dispatchItemRow}>
              <Text style={styles.dispatchLabel}>Est. Base Fare</Text>
              <Text style={[styles.dispatchVal, styles.dispatchPrice]}>
                ${selectedCategory === 'Plumbing' && '50'}
                {selectedCategory === 'Electrical' && '60'}
                {selectedCategory === 'Cleaning' && '40'}
                {selectedCategory === 'AC Repair' && '55'}
                {selectedCategory === 'Carpentry' && '45'}
                {selectedCategory === 'Painting' && '50'}
              </Text>
            </View>

            <Text style={styles.notesLabel}>Notes for Service Partner (Optional)</Text>
            <TextInput 
              style={styles.notesInput}
              placeholder="Explain problems: toilet leak, broken outlet..."
              placeholderTextColor={COLORS.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />

            <View style={styles.dispatchActions}>
              <TouchableOpacity 
                style={styles.dispatchCancelBtn} 
                onPress={() => setBookingDetailsOpen(false)}
              >
                <Text style={styles.dispatchCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.dispatchConfirmBtn} 
                onPress={handleInstantBook}
                disabled={requesting}
              >
                {requesting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.dispatchConfirmText}>Find Partner Now</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  workerBrief: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  workerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  workerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: ROUNDING.sm,
    marginBottom: 4,
  },
  ratingStar: {
    color: '#d97706',
    fontSize: 10,
    marginRight: 2,
  },
  ratingNum: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#d97706',
  },
  workerName: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  workerCategory: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  priceBrief: {
    alignItems: 'flex-end',
  },
  priceBriefVal: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.primaryDark,
  },
  priceBriefLabel: {
    fontSize: 9,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
  },
  actionCircleBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
  },
  cancelCircleBtn: {
    opacity: 0.9,
  },
  actionEmoji: {
    fontSize: 24,
    backgroundColor: '#f1f5f9',
    width: 48,
    height: 48,
    borderRadius: 24,
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.secondary,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: ROUNDING.md,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  reviewTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  reviewSub: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  starsGrid: {
    flexDirection: 'row',
    marginVertical: SPACING.md,
  },
  reviewStar: {
    fontSize: 36,
    marginHorizontal: 4,
  },
  starYellow: {
    color: '#fbbf24',
  },
  starGrey: {
    color: '#cbd5e1',
  },
  reviewTextarea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: ROUNDING.md,
    padding: SPACING.sm,
    width: '100%',
    height: 70,
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textDark,
    backgroundColor: '#f8fafc',
    textAlignVertical: 'top',
  },
  submitReviewBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: ROUNDING.md,
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.md,
    ...COLORS.glassShadow,
  },
  submitReviewText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 14,
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  pinPulse: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    opacity: 0.4,
  },
  addressBar: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: '#fff',
    borderRadius: ROUNDING.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    ...COLORS.cardShadow,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addressMarker: {
    fontSize: 16,
    marginRight: 8,
  },
  addressInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textDark,
  },
  bottomDashboardSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: ROUNDING.lg,
    borderTopRightRadius: ROUNDING.lg,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...COLORS.cardShadow,
  },
  categoryTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  categorySlider: {
    paddingBottom: SPACING.md,
  },
  categoryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: ROUNDING.md,
    padding: SPACING.md,
    marginRight: 10,
    alignItems: 'center',
    width: 80,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  categoryIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
  },
  categoryNameActive: {
    color: COLORS.primaryDark,
    fontFamily: FONTS.bold,
  },
  bookNowBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: ROUNDING.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...COLORS.glassShadow,
  },
  bookNowBtnText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  dispatchDetailsCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: ROUNDING.lg,
    borderTopRightRadius: ROUNDING.lg,
    padding: SPACING.lg,
  },
  dispatchTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  dispatchItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dispatchLabel: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  dispatchVal: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  dispatchPrice: {
    color: COLORS.primaryDark,
    fontSize: 18,
  },
  notesLabel: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.secondary,
    marginTop: 16,
    marginBottom: 6,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: ROUNDING.md,
    padding: SPACING.sm,
    height: 60,
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textDark,
    backgroundColor: '#f8fafc',
    textAlignVertical: 'top',
  },
  dispatchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  dispatchCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: ROUNDING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  dispatchCancelText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  dispatchConfirmBtn: {
    flex: 2,
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: ROUNDING.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    ...COLORS.glassShadow,
  },
  dispatchConfirmText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});

export default CustomerHome;
