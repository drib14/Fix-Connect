import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  ActivityIndicator 
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { COLORS, FONTS, SPACING, ROUNDING } from '../../theme';
import { getApiClient } from '../../utils/api';
import useStore from '../../store/useStore';

const WorkerDashboard = ({ navigation }) => {
  const { getToken, signOut } = useAuth();
  const queryClient = useQueryClient();
  const { user, setRole, logout, updateUserFields } = useStore();
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch bookings for calculating metrics
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', 'worker'],
    queryFn: async () => {
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.get('/bookings');
      return response.data;
    }
  });

  // Calculate metrics
  const completedBookings = bookings?.filter(b => b.status === 'completed') || [];
  const activeBookings = bookings?.filter(b => b.status === 'accepted') || [];
  const pendingRequestsCount = bookings?.filter(b => b.status === 'pending').length || 0;
  
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.price, 0);

  // Status toggle mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (newStatus) => {
      setUpdatingStatus(true);
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.put('/auth/profile', { status: newStatus });
      return response.data;
    },
    onSuccess: (data) => {
      // Sync local store
      updateUserFields({ status: data.status });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onSettled: () => {
      setUpdatingStatus(false);
    }
  });

  const handleStatusToggle = (val) => {
    const nextStatus = val ? 'online' : 'offline';
    toggleStatusMutation.mutate(nextStatus);
  };

  const handleRoleSwitch = async () => {
    try {
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.post('/auth/role', { role: 'customer' });
      setRole(response.data.role);
      
      // Update local storage store
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Worker Portal</Text>
          <Text style={styles.headerSubtitle}>Manage your jobs and services</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.switchButton} onPress={handleRoleSwitch}>
            <Text style={styles.switchButtonText}>Hire Help</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Availability Card */}
        <View style={[styles.card, styles.statusCard, isOnline && styles.statusCardOnline]}>
          <View>
            <Text style={styles.statusTitle}>Duty Availability</Text>
            <Text style={styles.statusSubtitle}>
              {isOnline ? 'You are visible to customers' : 'You are currently offline'}
            </Text>
          </View>
          <View style={styles.switchRow}>
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

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Earnings</Text>
            <Text style={[styles.statValue, { color: COLORS.primaryDark }]}>${totalEarnings}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>{completedBookings.length} jobs</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Active Contracts</Text>
            <Text style={styles.statValue}>{activeBookings.length} scheduled</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Category</Text>
            <Text style={[styles.statValue, { fontSize: 16 }]}>{user?.workerDetails?.category || 'General'}</Text>
          </View>
        </View>

        {/* Alerts / Actions */}
        {pendingRequestsCount > 0 && (
          <TouchableOpacity 
            style={styles.alertCard}
            onPress={() => navigation.navigate('WorkerBookings')}
          >
            <Text style={styles.alertIcon}>🔔</Text>
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>New Booking Requests</Text>
              <Text style={styles.alertDesc}>You have {pendingRequestsCount} pending requests waiting for approval.</Text>
            </View>
            <Text style={styles.alertLink}>View</Text>
          </TouchableOpacity>
        )}

        {/* Quick Links */}
        <Text style={styles.sectionTitle}>Quick Tasks</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('WorkerBookings')}
        >
          <View style={styles.menuItemLeft}>
            <Text style={styles.menuIcon}>🗓️</Text>
            <Text style={styles.menuText}>Service Bookings</Text>
          </View>
          <Text style={styles.menuChevron}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('WorkerServices')}
        >
          <View style={styles.menuItemLeft}>
            <Text style={styles.menuIcon}>💼</Text>
            <Text style={styles.menuText}>Manage My Services</Text>
          </View>
          <Text style={styles.menuChevron}>→</Text>
        </TouchableOpacity>
      </ScrollView>
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
  greeting: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.primaryLight,
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: ROUNDING.sm,
    marginRight: 6,
  },
  switchButtonText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: ROUNDING.sm,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: ROUNDING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...COLORS.cardShadow,
    marginBottom: SPACING.md,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 5,
    borderLeftColor: '#94a3b8',
  },
  statusCardOnline: {
    borderLeftColor: COLORS.primary,
    backgroundColor: '#f0fdf4',
  },
  statusTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  statusSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: ROUNDING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...COLORS.cardShadow,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: ROUNDING.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  alertIcon: {
    fontSize: 22,
  },
  alertTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#92400e',
  },
  alertDesc: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: '#b45309',
    marginTop: 2,
  },
  alertLink: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: '#92400e',
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: ROUNDING.md,
    padding: SPACING.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...COLORS.cardShadow,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.secondary,
  },
  menuChevron: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
  },
});

export default WorkerDashboard;
