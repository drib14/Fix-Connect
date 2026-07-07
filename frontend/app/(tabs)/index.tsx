import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ServiceCard } from '@/components/ServiceCard';
import { ServiceCardSkeleton } from '@/components/SkeletonLoader';
import { useAuthStore } from '@/store/useAuthStore';
import { useBookingStore } from '@/store/useBookingStore';
import { useServices, useActiveBooking } from '@/hooks/useBookingQuery';
import { SERVICE_CATEGORIES, ServiceCategory } from '@/constants/services';
import { COLORS, SHADOWS } from '@/constants/theme';
import { STATUS_LABELS } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: services, isLoading: servicesLoading, refetch } = useServices();
  const { data: activeBooking } = useActiveBooking();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleServicePress = (service: ServiceCategory) => {
    useBookingStore.getState().setDraft({
      service_id: '',
      service_title: service.title,
      category: service.id,
      latitude: 0,
      longitude: 0,
      formatted_address: '',
      problem_description: '',
      attachment_urls: [],
      scheduled_at: null,
    });
    router.push('/booking/setup');
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary[500]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()} 👋</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <Pressable style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text.primary} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>

        {/* Active Booking Banner */}
        {activeBooking && (
          <Pressable
            onPress={() => router.push('/booking/active')}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          >
            <LinearGradient
              colors={[COLORS.primary[600], COLORS.primary[800]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.activeBanner, SHADOWS.medium]}
            >
              <View style={styles.activeBannerContent}>
                <View style={styles.activeBannerIcon}>
                  <Ionicons name="construct" size={22} color="#FFF" />
                </View>
                <View style={styles.activeBannerText}>
                  <Text style={styles.activeBannerTitle}>Active Booking</Text>
                  <Text style={styles.activeBannerStatus}>
                    {STATUS_LABELS[activeBooking.status] || activeBooking.status}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
              </View>
            </LinearGradient>
          </Pressable>
        )}

        {/* Search Bar */}
        <Pressable
          style={[styles.searchBar, SHADOWS.small]}
          onPress={() => router.push('/booking/setup')}
        >
          <Ionicons name="search" size={20} color={COLORS.text.light} />
          <Text style={styles.searchPlaceholder}>What service do you need?</Text>
        </Pressable>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable style={styles.quickAction} onPress={() => router.push('/booking/setup')}>
            <LinearGradient
              colors={[COLORS.accent.DEFAULT, COLORS.accent.dark]}
              style={styles.quickActionIcon}
            >
              <Ionicons name="flash" size={20} color="#FFF" />
            </LinearGradient>
            <Text style={styles.quickActionLabel}>Book Now</Text>
          </Pressable>
          <Pressable style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.primary[100] }]}>
              <Ionicons name="time" size={20} color={COLORS.primary[600]} />
            </View>
            <Text style={styles.quickActionLabel}>Schedule</Text>
          </Pressable>
          <Pressable style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="pricetag" size={20} color={COLORS.accent.DEFAULT} />
            </View>
            <Text style={styles.quickActionLabel}>Promos</Text>
          </Pressable>
          <Pressable style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="help-circle" size={20} color="#42A5F5" />
            </View>
            <Text style={styles.quickActionLabel}>Help</Text>
          </Pressable>
        </View>

        {/* Services Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <Text style={styles.sectionSubtitle}>Choose a service category</Text>
        </View>

        <View style={styles.servicesGrid}>
          {servicesLoading
            ? Array.from({ length: 8 }).map((_, i) => <ServiceCardSkeleton key={i} />)
            : SERVICE_CATEGORIES.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onPress={handleServicePress}
                />
              ))}
        </View>

        {/* Promo Banner */}
        <LinearGradient
          colors={['#FF6D00', '#FF9800']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.promoBanner, SHADOWS.medium]}
        >
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>First Booking?</Text>
            <Text style={styles.promoSubtitle}>Get ₱100 off on your first service!</Text>
            <View style={styles.promoTag}>
              <Text style={styles.promoTagText}>FIXNEW100</Text>
            </View>
          </View>
          <Ionicons name="gift" size={50} color="rgba(255,255,255,0.3)" />
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 13,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginTop: 2,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent.DEFAULT,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  activeBanner: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  activeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBannerText: {
    flex: 1,
    marginLeft: 14,
  },
  activeBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  activeBannerStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    gap: 10,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: COLORS.text.light,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAction: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  promoBanner: {
    borderRadius: 20,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  promoSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  promoTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  promoTagText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
});
