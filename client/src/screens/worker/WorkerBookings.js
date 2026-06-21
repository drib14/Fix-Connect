import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { COLORS, FONTS, SPACING, ROUNDING } from '../../theme';
import { getApiClient } from '../../utils/api';
import SkeletalLoader from '../../components/SkeletalLoader';

const STATUS_STYLING = {
  pending: { label: 'Awaiting Response', color: '#f59e0b', bg: '#fef3c7' },
  accepted: { label: 'Scheduled', color: '#10b981', bg: '#d1fae5' },
  declined: { label: 'Declined by You', color: '#ef4444', bg: '#fef2f2' },
  completed: { label: 'Completed', color: '#3b82f6', bg: '#dbeafe' },
  cancelled: { label: 'Cancelled by Customer', color: '#64748b', bg: '#f1f5f9' },
};

const WorkerBookings = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  // Query for worker bookings
  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['bookings', 'worker'],
    queryFn: async () => {
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.get('/bookings');
      return response.data;
    }
  });

  // Booking status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, newStatus }) => {
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.put(`/bookings/${bookingId}/status`, { status: newStatus });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    }
  });

  const handleStatusChange = (bookingId, status) => {
    updateStatusMutation.mutate({ bookingId, newStatus: status });
  };

  const renderBookingItem = ({ item }) => {
    const statusStyle = STATUS_STYLING[item.status] || STATUS_STYLING.pending;
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.customerName}>{item.customer?.name || 'Customer'}</Text>
            <Text style={styles.serviceName}>{item.service?.name}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Schedule:</Text>
            <Text style={styles.metaVal}>{item.date} at {item.time}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Earnings:</Text>
            <Text style={[styles.metaVal, styles.earningsText]}>${item.price}</Text>
          </View>
          {item.notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Customer Instructions:</Text>
              <Text style={styles.notesText}>"{item.notes}"</Text>
            </View>
          ) : null}
        </View>

        {/* Action Triggers */}
        {item.status === 'pending' && (
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.declineBtn]}
              onPress={() => handleStatusChange(item._id, 'declined')}
            >
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => handleStatusChange(item._id, 'accepted')}
            >
              <Text style={styles.acceptBtnText}>Accept Job</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'accepted' && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.completeBtn]}
            onPress={() => handleStatusChange(item._id, 'completed')}
          >
            <Text style={styles.completeBtnText}>Mark as Completed</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const pendingRequests = bookings?.filter(b => b.status === 'pending') || [];
  const scheduledJobs = bookings?.filter(b => b.status !== 'pending') || [];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), paddingBottom: SPACING.md }]}>
        <Text style={styles.title}>Job Appointments</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={styles.refreshLink}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ padding: SPACING.md }}>
          <SkeletalLoader type="card" count={3} />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}
        >
          {pendingRequests.length > 0 && (
            <View>
              <Text style={styles.sectionHeader}>Pending Job Requests ({pendingRequests.length})</Text>
              {pendingRequests.map(item => (
                <View key={item._id}>
                  {renderBookingItem({ item })}
                </View>
              ))}
            </View>
          )}

          <Text style={styles.sectionHeader}>Contract History & Schedule</Text>
          {scheduledJobs.length > 0 ? (
            scheduledJobs.map(item => (
              <View key={item._id}>
                {renderBookingItem({ item })}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No contracts scheduled.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.secondary,
    borderBottomLeftRadius: ROUNDING.lg,
    borderBottomRightRadius: ROUNDING.lg,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#fff',
  },
  refreshLink: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  sectionHeader: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    marginTop: 10,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: ROUNDING.md,
    padding: SPACING.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...COLORS.cardShadow,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  serviceName: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ROUNDING.sm,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  metaContainer: {
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  metaLabel: {
    width: 80,
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  metaVal: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.secondary,
  },
  earningsText: {
    color: COLORS.primaryDark,
    fontFamily: FONTS.bold,
  },
  notesBox: {
    marginTop: 8,
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: ROUNDING.sm,
  },
  notesLabel: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
  },
  notesText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textDark,
    marginTop: 2,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    height: 38,
    borderRadius: ROUNDING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  declineBtn: {
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fff',
  },
  declineBtnText: {
    color: '#ef4444',
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  acceptBtn: {
    backgroundColor: COLORS.primary,
    ...COLORS.glassShadow,
  },
  acceptBtnText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  completeBtn: {
    backgroundColor: '#3b82f6',
    marginTop: SPACING.md,
  },
  completeBtnText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: ROUNDING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
  },
});

export default WorkerBookings;
