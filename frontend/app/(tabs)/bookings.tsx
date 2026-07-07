import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BookingCard } from '@/components/BookingCard';
import { BookingCardSkeleton } from '@/components/SkeletonLoader';
import { useActiveBooking, useBookingHistory } from '@/hooks/useBookingQuery';
import { COLORS } from '@/constants/theme';

type Tab = 'active' | 'history';

export default function BookingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [page, setPage] = useState(1);

  const {
    data: activeBooking,
    isLoading: activeLoading,
    refetch: refetchActive,
  } = useActiveBooking();

  const {
    data: historyData,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useBookingHistory(page);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'active') await refetchActive();
    else await refetchHistory();
    setRefreshing(false);
  };

  const handleBookingPress = (bookingId: string) => {
    router.push('/booking/active');
  };

  const isLoading = activeTab === 'active' ? activeLoading : historyLoading;
  const bookings =
    activeTab === 'active'
      ? activeBooking
        ? [activeBooking]
        : []
      : historyData?.bookings || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setActiveTab('active')}
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('history')}
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </Pressable>
      </View>

      {/* Booking List */}
      {isLoading ? (
        <View style={styles.skeletonList}>
          {Array.from({ length: 4 }).map((_, i) => (
            <BookingCardSkeleton key={i} />
          ))}
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name={activeTab === 'active' ? 'calendar-outline' : 'time-outline'}
            size={64}
            color={COLORS.text.light}
          />
          <Text style={styles.emptyTitle}>
            {activeTab === 'active' ? 'No Active Bookings' : 'No Booking History'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'active'
              ? 'Book a service from the home screen to get started.'
              : 'Your completed and cancelled bookings will appear here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <BookingCard booking={item} onPress={handleBookingPress} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary[500]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 12,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#E8E8E8',
  },
  tabActive: {
    backgroundColor: COLORS.primary[600],
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },
  skeletonList: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
