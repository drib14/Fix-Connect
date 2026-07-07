import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookingStore } from '@/store/useBookingStore';
import { useRequestProvider, useCancelBooking } from '@/hooks/useBookingQuery';
import { useSocket } from '@/hooks/useSocket';
import { COLORS } from '@/constants/theme';

export default function MatchingScreen() {
  const router = useRouter();
  const activeBookingId = useBookingStore((s) => s.activeBookingId);
  const activeStatus = useBookingStore((s) => s.activeStatus);
  const draft = useBookingStore((s) => s.draft);

  const requestProviderMutation = useRequestProvider();
  const cancelBookingMutation = useCancelBooking();
  const { connect, joinBooking, disconnect } = useSocket();

  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Radar pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Initiate matching broadcast & socket listening
  useEffect(() => {
    let activeSocket: any = null;

    const initMatching = async () => {
      if (!activeBookingId) return;

      try {
        // 1. Establish socket connection
        activeSocket = await connect();

        // 2. Transition state DRAFT -> SEARCHING (Broadcasting)
        await requestProviderMutation.mutateAsync(activeBookingId);

        // 3. Register to socket updates
        joinBooking(activeBookingId);
      } catch (err: any) {
        Alert.alert('Search Error', 'Unable to initiate provider search at this time.');
        router.replace('/(tabs)');
      }
    };

    initMatching();

    return () => {
      disconnect();
    };
  }, [activeBookingId]);

  // Navigate once provider accepts (status transitions to ACCEPTED)
  useEffect(() => {
    if (activeStatus && activeStatus !== 'SEARCHING' && activeStatus !== 'DRAFT') {
      router.replace('/booking/active');
    }
  }, [activeStatus]);

  const handleCancelSearch = async () => {
    if (!activeBookingId) return;

    Alert.alert('Cancel Search', 'Are you sure you want to cancel finding a provider?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelBookingMutation.mutateAsync({
              bookingId: activeBookingId,
              reason: 'User cancelled search',
            });
            useBookingStore.getState().clearActiveBooking();
            router.replace('/(tabs)');
          } catch (err: any) {
            Alert.alert('Error', 'Failed to cancel search request.');
          }
        },
      },
    ]);
  };

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1.8],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.radarContainer}>
        {/* Animated radar rings */}
        <Animated.View style={[styles.pulseRing, { transform: [{ scale }], opacity }]} />
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.4] }) }],
              opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
            },
          ]}
        />

        <View style={styles.centerPill}>
          <Ionicons name="build" size={32} color="#FFF" />
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Finding Nearby Providers</Text>
        <Text style={styles.subtitle}>
          Connecting you with the best {draft?.service_title || 'service'} specialist in your area.
        </Text>
        <ActivityIndicator color={COLORS.primary[600]} style={{ marginTop: 24 }} />
      </View>

      <Pressable onPress={handleCancelSearch} style={styles.cancelBtn}>
        <Text style={styles.cancelText}>Cancel Request</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 250,
    height: 250,
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primary[300],
  },
  centerPill: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  cancelBtn: {
    position: 'absolute',
    bottom: 60,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.status.CANCELLED,
  },
});
