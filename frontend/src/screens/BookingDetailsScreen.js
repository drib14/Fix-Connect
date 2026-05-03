import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Linking } from 'react-native';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { ToastContext } from '../contexts/ToastContext';
import ChatInterface from '../components/ChatInterface';
import { ArrowLeft } from 'lucide-react-native';

export default function BookingDetailsScreen({ route, navigation }) {
  const { bookingId } = route.params;
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await api.get(`/bookings/${bookingId}`);
        if (data.success) setBooking(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handlePayment = async () => {
    try {
      const { data } = await api.post(`/bookings/${bookingId}/pay`);
      if (data.success && data.checkoutUrl) {
        Linking.openURL(data.checkoutUrl);
      }
    } catch (error) {
      showToast('Error initializing payment. Missing API keys?');
    }
  };

  const markPaidDemo = async () => {
    try {
      const { data } = await api.put(`/bookings/${bookingId}/mark-paid`);
      if (data.success) {
        setBooking(data.data);
        showToast('Payment successful! Invoice generated.');
      }
    } catch (error) {
      showToast('Error marking paid');
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#10b981" /></View>;
  }

  if (!booking) {
    return <View style={styles.center}><Text style={{color: '#fff'}}>Booking not found.</Text></View>;
  }

  const isCustomer = user.role === 'customer';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 15}}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Job Details</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.serviceText}>{booking.serviceType}</Text>
        <Text style={styles.statusText(booking.status)}>Status: {booking.status.toUpperCase()}</Text>
        <Text style={styles.infoText}>Address: {booking.location.address}</Text>
        <View style={styles.divider} />

        <Text style={styles.invoiceTitle}>Invoice Summary</Text>
        <Text style={styles.infoText}>Base Fee: ₱{booking.priceAtBooking}</Text>
        <Text style={styles.infoText}>Payment Status: <Text style={{color: booking.paymentStatus === 'paid' ? '#10b981' : '#f59e0b'}}>{booking.paymentStatus.toUpperCase()}</Text></Text>
        {booking.invoiceId && <Text style={styles.infoText}>Invoice ID: {booking.invoiceId}</Text>}

        {isCustomer && booking.status === 'completed' && booking.paymentStatus !== 'paid' && (
          <View style={styles.payBtnContainer}>
            <TouchableOpacity style={styles.payBtn} onPress={handlePayment}>
              <Text style={styles.payBtnTxt}>Pay with PayMongo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.payBtn, {backgroundColor: '#3b82f6', marginTop: 10}]} onPress={markPaidDemo}>
              <Text style={styles.payBtnTxt}>Simulate Payment (Dev)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.chatTitle}>Chat with {isCustomer ? 'Worker' : 'Customer'}</Text>
      <View style={styles.chatContainer}>
        <ChatInterface bookingId={booking._id} status={booking.status} updatedAt={booking.updatedAt} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, backgroundColor: '#1f2937' },
  title: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
  infoCard: { backgroundColor: '#1f2937', padding: 20, margin: 15, borderRadius: 8 },
  serviceText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  statusText: (status) => ({ color: status === 'pending' ? '#f59e0b' : status === 'completed' ? '#10b981' : '#3b82f6', fontWeight: 'bold', marginBottom: 5 }),
  infoText: { color: '#d1d5db', marginBottom: 5 },
  divider: { height: 1, backgroundColor: '#374151', marginVertical: 10 },
  invoiceTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  payBtnContainer: { marginTop: 15 },
  payBtn: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center' },
  payBtnTxt: { color: '#fff', fontWeight: 'bold' },
  chatTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginHorizontal: 15, marginTop: 10, marginBottom: 5 },
  chatContainer: { flex: 1, marginHorizontal: 15, marginBottom: 15, borderRadius: 8, overflow: 'hidden' }
});
