import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView from '@/components/MapView';
import { ActiveTrackerCard } from '@/components/ActiveTrackerCard';
import { useBookingStore } from '@/store/useBookingStore';
import { useCancelBooking } from '@/hooks/useBookingQuery';
import { useSocket } from '@/hooks/useSocket';
import { COLORS, SHADOWS } from '@/constants/theme';

export default function ActiveBookingScreen() {
  const router = useRouter();
  const {
    activeBookingId,
    activeStatus,
    provider,
    providerLocation,
    otpCode,
    draft,
  } = useBookingStore();

  const cancelBookingMutation = useCancelBooking();
  const { connect, joinBooking, disconnect } = useSocket();
  const [chatCount, setChatCount] = useState(0);

  // Maintain Socket room connection
  useEffect(() => {
    let activeSocket: any = null;

    const setupSocket = async () => {
      if (!activeBookingId) return;
      activeSocket = await connect();
      joinBooking(activeBookingId);
    };

    setupSocket();

    return () => {
      disconnect();
    };
  }, [activeBookingId]);

  // Handle terminal state routing transitions
  useEffect(() => {
    if (activeStatus === 'COMPLETED') {
      router.replace('/booking/completion');
    } else if (activeStatus === 'CANCELLED') {
      Alert.alert('Booking Cancelled', 'This booking was cancelled.');
      useBookingStore.getState().clearActiveBooking();
      router.replace('/(tabs)');
    }
  }, [activeStatus]);

  const handleCancelBooking = () => {
    if (!activeBookingId) return;

    const enRoutePenalty = activeStatus === 'EN_ROUTE' || activeStatus === 'ARRIVED';
    const message = enRoutePenalty
      ? 'Cancelling now will incur a 20% cancellation fee as the provider is already traveling. Do you wish to proceed?'
      : 'Are you sure you want to cancel this service request?';

    Alert.alert('Cancel Booking', message, [
      { text: 'Keep Booking', style: 'cancel' },
      {
        text: 'Cancel Booking',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelBookingMutation.mutateAsync({
              bookingId: activeBookingId,
              reason: 'User cancelled booking en route',
            });
          } catch (err: any) {
            Alert.alert('Error', 'Failed to cancel the booking.');
          }
        },
      },
    ]);
  };

  const centerLatitude = draft?.latitude || 14.5995;
  const centerLongitude = draft?.longitude || 120.9842;

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Absolute Overlay Header Navigation */}
      <SafeAreaView style={styles.overlayHeader} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.replace('/(tabs)')} style={[styles.backBtn, SHADOWS.medium]}>
            <Ionicons name="close" size={24} color={COLORS.text.primary} />
          </Pressable>
          <View style={[styles.titleBadge, SHADOWS.medium]}>
            <Text style={styles.badgeText}>{draft?.service_title || 'Service Tracker'}</Text>
          </View>
          <Pressable style={[styles.backBtn, SHADOWS.medium]}>
            <Ionicons name="chatbubbles" size={20} color={COLORS.primary[600]} />
            {chatCount > 0 && <View style={styles.chatBadge} />}
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Map rendering wrapper */}
      <View style={styles.mapWrapper}>
        <MapView
          userLocation={{ latitude: centerLatitude, longitude: centerLongitude }}
          providerLocation={providerLocation}
          height={500}
        />
      </View>

      {/* Booking active status slider card details */}
      {provider && activeStatus && (
        <ActiveTrackerCard
          provider={provider}
          status={activeStatus}
          eta={providerLocation?.eta}
          otpCode={otpCode}
        />
      )}

      {/* Cancel button en route */}
      {(activeStatus === 'ACCEPTED' || activeStatus === 'EN_ROUTE') && (
        <Pressable onPress={handleCancelBooking} style={styles.abortBtn}>
          <Text style={styles.abortText}>Cancel Booking</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  overlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  chatBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent.DEFAULT,
  },
  mapWrapper: {
    flex: 1,
  },
  abortBtn: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: 220,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.2)',
  },
  abortText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.status.CANCELLED,
  },
});
