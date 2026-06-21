import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { COLORS, FONTS, SPACING, ROUNDING } from '../../theme';
import { getApiClient } from '../../utils/api';
import SkeletalLoader from '../../components/SkeletalLoader';

const STATUS_CONFIGS = {
  pending: { label: 'Pending Approval', color: '#f59e0b', bg: '#fef3c7' },
  accepted: { label: 'Scheduled', color: '#10b981', bg: '#d1fae5' },
  declined: { label: 'Declined', color: '#ef4444', bg: '#fef2f2' },
  completed: { label: 'Completed', color: '#3b82f6', bg: '#dbeafe' },
  cancelled: { label: 'Cancelled', color: '#64748b', bg: '#f1f5f9' },
};

const CustomerBookings = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // Query for getting bookings
  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['bookings', 'customer'],
    queryFn: async () => {
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.get('/bookings');
      return response.data;
    }
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId) => {
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.put(`/bookings/${bookingId}/status`, { status: 'cancelled' });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'customer'] });
    }
  });

  const renderBookingCard = ({ item }) => {
    const status = STATUS_CONFIGS[item.status] || STATUS_CONFIGS.pending;
    
    return (
      <View style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.serviceName}>{item.service?.name || 'Service Appointment'}</Text>
            <Text style={styles.workerName}>Worker: {item.worker?.name || 'Assigned Partner'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Schedule:</Text>
            <Text style={styles.detailValue}>{item.date} at {item.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Est. Price:</Text>
            <Text style={[styles.detailValue, styles.price]}>${item.price}</Text>
          </View>
          {item.notes ? (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          ) : null}
        </View>

        {item.status === 'pending' && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => cancelBookingMutation.mutate(item._id)}
            disabled={cancelBookingMutation.isLoading}
          >
            {cancelBookingMutation.isLoading ? (
              <ActivityIndicator color="#ef4444" size="small" />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Appointments</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={styles.refreshLink}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ padding: SPACING.md }}>
          <SkeletalLoader type="card" count={3} />
        </View>
      ) : bookings && bookings.length > 0 ? (
        <FlatList
          data={bookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You haven't booked any appointments yet.</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 50,
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
  listContainer: {
    padding: SPACING.md,
  },
  bookingCard: {
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
  serviceName: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    maxWidth: '70%',
  },
  workerName: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ROUNDING.sm,
  },
  statusText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  cardDetails: {
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    width: 80,
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.secondary,
  },
  price: {
    color: COLORS.primaryDark,
    fontFamily: FONTS.bold,
  },
  notesContainer: {
    marginTop: 6,
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
  },
  cancelButton: {
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingVertical: 8,
    borderRadius: ROUNDING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});

export default CustomerBookings;
