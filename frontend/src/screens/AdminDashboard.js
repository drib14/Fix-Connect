import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings');
        if (data.success) setBookings(data.data);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchBookings();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.serviceText}>ID: {item._id}</Text>
      <Text style={styles.infoText}>Status: <Text style={styles.statusText(item.status)}>{item.status.toUpperCase()}</Text></Text>
      <Text style={styles.infoText}>Customer: {item.customer?.email}</Text>
      <Text style={styles.infoText}>Worker: {item.worker ? item.worker.email : 'None'}</Text>
      <Text style={styles.infoText}>Amount: ₱{item.priceAtBooking}</Text>
      <Text style={styles.infoText}>Payment: {item.paymentStatus.toUpperCase()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutTxt}>Logout</Text></TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>All System Bookings</Text>
      {loading ? <ActivityIndicator size="large" color="#10b981" /> : (
        <FlatList data={bookings} keyExtractor={(item) => item._id} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 20 }} />
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
  serviceText: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  statusText: (status) => ({ color: status === 'pending' ? '#f59e0b' : status === 'completed' ? '#10b981' : '#3b82f6', fontWeight: 'bold' }),
  infoText: { color: '#d1d5db', marginBottom: 2, fontSize: 12 }
});
