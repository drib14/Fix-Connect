import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';
import { ToastContext } from '../contexts/ToastContext';

export default function CustomerDashboard({ navigation }) {
  const { logout, user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const { showToast } = useContext(ToastContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      if (data.success) setBookings(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    if (socket) {
      socket.on('bookingStatusUpdated', (data) => {
        showToast(data.message || `Booking status: ${data.status}`);
        fetchBookings();
      });
    }
    return () => {
      if (socket) socket.off('bookingStatusUpdated');
    };
  }, [socket]);

  const createBooking = async () => {
    try {
      const { data } = await api.post('/bookings', {
        serviceType: 'Plumbing Service',
        location: { address: '123 Test St', lat: 14.5995, lng: 120.9842 },
        priceAtBooking: 600
      });
      if (data.success) {
        showToast('Booking requested successfully!');
        fetchBookings();
      }
    } catch (error) {
      showToast('Error creating booking');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BookingDetails', { bookingId: item._id })}>
      <View style={styles.cardHeader}>
        <Text style={styles.serviceText}>{item.serviceType}</Text>
        <Text style={styles.statusText(item.status)}>{item.status.toUpperCase()}</Text>
      </View>
      <Text style={styles.infoText}>Worker: {item.worker ? `${item.worker.firstName} ${item.worker.lastName}` : 'Searching...'}</Text>
      <Text style={styles.infoText}>Price: ₱{item.priceAtBooking}</Text>
      <Text style={styles.infoText}>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user?.firstName}</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutTxt}>Logout</Text></TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.newBtn} onPress={createBooking}>
        <Text style={styles.newBtnText}>+ Request New Service</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Your Bookings</Text>
      {loading ? <ActivityIndicator size="large" color="#10b981" /> : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={{color: '#9ca3af'}}>No bookings found.</Text>}
        />
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
  newBtn: { backgroundColor: '#10b981', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  newBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  subtitle: { fontSize: 18, color: '#9ca3af', marginBottom: 10 },
  card: { backgroundColor: '#1f2937', padding: 15, borderRadius: 8, marginBottom: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  serviceText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  statusText: (status) => ({ color: status === 'pending' ? '#f59e0b' : status === 'completed' ? '#10b981' : '#3b82f6', fontWeight: 'bold' }),
  infoText: { color: '#d1d5db', marginBottom: 5 }
});
