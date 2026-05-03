import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';
import { ToastContext } from '../contexts/ToastContext';

export default function WorkerDashboard({ navigation }) {
  const { logout, user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const { showToast } = useContext(ToastContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      if (data.success) setBookings(data.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchBookings();
    if (socket) {
      socket.on('newBookingAvailable', () => { showToast('New booking available!'); fetchBookings(); });
      socket.on('bookingStatusUpdated', () => fetchBookings());
    }
    return () => {
      if (socket) { socket.off('newBookingAvailable'); socket.off('bookingStatusUpdated'); }
    };
  }, [socket]);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/bookings/${id}/status`, { status });
      if (data.success) { showToast(`Status updated to ${status}`); fetchBookings(); }
    } catch (error) { showToast('Error updating status'); }
  };

  const renderItem = ({ item }) => {
    const isMine = item.worker && item.worker._id === user._id;
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BookingDetails', { bookingId: item._id })}>
        <View style={styles.cardHeader}>
          <Text style={styles.serviceText}>{item.serviceType}</Text>
          <Text style={styles.statusText(item.status)}>{item.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.infoText}>Address: {item.location.address}</Text>
        <Text style={styles.infoText}>Price: ₱{item.priceAtBooking}</Text>
        {item.status === 'pending' && !isMine && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus(item._id, 'accepted')}>
            <Text style={styles.actionBtnTxt}>Accept Job</Text>
          </TouchableOpacity>
        )}
        {isMine && item.status === 'accepted' && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus(item._id, 'en_route')}>
            <Text style={styles.actionBtnTxt}>En Route</Text>
          </TouchableOpacity>
        )}
        {isMine && item.status === 'en_route' && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus(item._id, 'completed')}>
            <Text style={styles.actionBtnTxt}>Mark Completed</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Worker Panel</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutTxt}>Logout</Text></TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Available & Active Jobs</Text>
      {loading ? <ActivityIndicator size="large" color="#10b981" /> : (
        <FlatList data={bookings} keyExtractor={(item) => item._id} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 20 }} ListEmptyComponent={<Text style={{color: '#9ca3af'}}>No jobs available.</Text>} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 40 },
  title: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  logoutBtn: { padding: 8, backgroundColor: '#374151', borderRadius: 8 },
  logoutTxt: { color: '#ef4444', fontWeight: 'bold' },
  subtitle: { fontSize: 18, color: '#9ca3af', marginBottom: 10 },
  card: { backgroundColor: '#1f2937', padding: 15, borderRadius: 8, marginBottom: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  serviceText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  statusText: (status) => ({ color: status === 'pending' ? '#f59e0b' : status === 'completed' ? '#10b981' : '#3b82f6', fontWeight: 'bold' }),
  infoText: { color: '#d1d5db', marginBottom: 5 },
  actionBtn: { backgroundColor: '#10b981', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' },
  actionBtnTxt: { color: '#fff', fontWeight: 'bold' }
});
