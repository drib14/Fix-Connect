import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '@/constants/theme';
import { CATEGORY_MAP } from '@/constants/services';
import { formatCurrency, formatDate, timeAgo } from '@/utils/formatters';

type BookingCardProps = {
  booking: {
    _id: string;
    status: string;
    formatted_address: string;
    total_amount: number;
    created_at: string;
    service_id?: {
      title: string;
      category: string;
    };
    provider_id?: {
      name: string;
      avatar_url: string;
    };
  };
  onPress: (bookingId: string) => void;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  SEARCHING: { label: 'Searching', color: COLORS.status.SEARCHING, icon: 'search' },
  ACCEPTED: { label: 'Accepted', color: COLORS.status.ACCEPTED, icon: 'checkmark-circle' },
  EN_ROUTE: { label: 'En Route', color: COLORS.status.EN_ROUTE, icon: 'navigate' },
  ARRIVED: { label: 'Arrived', color: COLORS.status.ARRIVED, icon: 'location' },
  IN_PROGRESS: { label: 'In Progress', color: COLORS.status.IN_PROGRESS, icon: 'construct' },
  COMPLETED: { label: 'Completed', color: COLORS.status.COMPLETED, icon: 'checkmark-done' },
  CANCELLED: { label: 'Cancelled', color: COLORS.status.CANCELLED, icon: 'close-circle' },
  EXPIRED: { label: 'Expired', color: COLORS.status.EXPIRED, icon: 'time' },
};

export function BookingCard({ booking, onPress }: BookingCardProps) {
  const statusInfo = STATUS_CONFIG[booking.status] || STATUS_CONFIG.EXPIRED;
  const category = booking.service_id ? CATEGORY_MAP[booking.service_id.category] : null;

  return (
    <Pressable
      onPress={() => onPress(booking._id)}
      style={({ pressed }) => [
        styles.container,
        SHADOWS.small,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.categoryIcon, { backgroundColor: category?.color || COLORS.primary[500] }]}>
          <Ionicons name={category?.icon || 'construct'} size={20} color="#FFF" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.serviceTitle}>
            {booking.service_id?.title || 'Service'}
          </Text>
          <Text style={styles.timestamp}>{timeAgo(booking.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '18' }]}>
          <Ionicons name={statusInfo.icon} size={12} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* Address */}
      <View style={styles.addressRow}>
        <Ionicons name="location-outline" size={14} color={COLORS.text.secondary} />
        <Text style={styles.address} numberOfLines={1}>
          {booking.formatted_address}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {booking.provider_id && (
          <Text style={styles.providerName}>
            <Ionicons name="person" size={11} color={COLORS.text.secondary} />{' '}
            {booking.provider_id.name}
          </Text>
        )}
        <Text style={styles.amount}>{formatCurrency(booking.total_amount)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  address: {
    fontSize: 12,
    color: COLORS.text.secondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  providerName: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary[700],
  },
});
