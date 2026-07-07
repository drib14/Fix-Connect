import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '@/constants/theme';
import { formatETA } from '@/utils/formatters';
import type { ProviderInfo } from '@/store/useBookingStore';

type ActiveTrackerCardProps = {
  provider: ProviderInfo;
  status: string;
  eta?: number;
  otpCode?: string | null;
};

const STATUS_MESSAGES: Record<string, { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }> = {
  ACCEPTED: {
    title: 'Provider Accepted!',
    subtitle: 'Your provider is getting ready to head your way.',
    icon: 'checkmark-circle',
  },
  EN_ROUTE: {
    title: 'Provider En Route',
    subtitle: 'Your provider is on their way to your location.',
    icon: 'navigate',
  },
  ARRIVED: {
    title: 'Provider Arrived!',
    subtitle: 'Share the verification code with your provider to begin.',
    icon: 'location',
  },
  IN_PROGRESS: {
    title: 'Service In Progress',
    subtitle: 'Your service provider is currently working on the job.',
    icon: 'construct',
  },
};

export function ActiveTrackerCard({ provider, status, eta, otpCode }: ActiveTrackerCardProps) {
  const statusInfo = STATUS_MESSAGES[status] || STATUS_MESSAGES.ACCEPTED;

  return (
    <View style={[styles.container, SHADOWS.large]}>
      {/* Status Header */}
      <View style={styles.statusHeader}>
        <View style={[styles.statusDot, { backgroundColor: COLORS.status[status as keyof typeof COLORS.status] || COLORS.primary[500] }]} />
        <Text style={styles.statusTitle}>{statusInfo.title}</Text>
      </View>
      <Text style={styles.statusSubtitle}>{statusInfo.subtitle}</Text>

      {/* ETA Badge */}
      {eta && status === 'EN_ROUTE' && (
        <View style={styles.etaBadge}>
          <Ionicons name="time" size={16} color={COLORS.primary[700]} />
          <Text style={styles.etaText}>ETA: {formatETA(eta)}</Text>
        </View>
      )}

      {/* OTP Code Display */}
      {status === 'ARRIVED' && otpCode && (
        <View style={styles.otpContainer}>
          <Text style={styles.otpLabel}>Verification Code</Text>
          <View style={styles.otpRow}>
            {otpCode.split('').map((digit, idx) => (
              <View key={idx} style={styles.otpDigit}>
                <Text style={styles.otpDigitText}>{digit}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Provider Info */}
      <View style={styles.providerRow}>
        <View style={styles.avatarContainer}>
          {provider.avatar_url ? (
            <Image source={{ uri: provider.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={20} color="#FFF" />
            </View>
          )}
        </View>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{provider.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#FFA726" />
            <Text style={styles.ratingText}>
              {provider.average_rating.toFixed(1)} • {provider.total_completed} jobs
            </Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <View style={styles.actionBtn}>
            <Ionicons name="call" size={18} color={COLORS.primary[600]} />
          </View>
          <View style={styles.actionBtn}>
            <Ionicons name="chatbubble" size={18} color={COLORS.primary[600]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 32,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  statusSubtitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 4,
    lineHeight: 18,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[50],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 14,
    gap: 6,
    alignSelf: 'flex-start',
  },
  etaText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary[700],
  },
  otpContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  otpLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 10,
  },
  otpDigit: {
    width: 52,
    height: 60,
    borderRadius: 14,
    backgroundColor: COLORS.primary[50],
    borderWidth: 2,
    borderColor: COLORS.primary[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpDigitText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary[700],
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  avatarContainer: {},
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
