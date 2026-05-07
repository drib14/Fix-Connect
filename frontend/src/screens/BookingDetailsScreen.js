import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Title, Card, Text, Button, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';
import api from '../api/axios';
import ChatInterface from '../components/ChatInterface';

const BookingDetailsScreen = ({ route }) => {
  const { bookingId } = route.params;
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, []);

  useEffect(() => {
    if (socket && booking) {
      const handleStatusUpdate = (data) => {
        if(data.bookingId === bookingId) {
           setBooking(prev => ({ ...prev, status: data.status }));
        }
      };

      socket.on('bookingStatusUpdated', handleStatusUpdate);

      return () => {
        socket.off('bookingStatusUpdated', handleStatusUpdate);
      };
    }
  }, [socket, booking, bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data.data);
    } catch (error) {
      console.log('Error fetching booking', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      setBooking(prev => ({ ...prev, status: newStatus }));
      // socket handles the rest on the backend

      if(newStatus === 'completed') {
        fetchBooking();
      }
    } catch (error) {
      console.log('Error updating status', error);
    }
  };

  const generatePaymentLink = async () => {
      try {
          const res = await api.post(`/bookings/${bookingId}/pay`);
          if(res.data.success) {
              Linking.openURL(res.data.checkoutUrl);
          }
      } catch (err) {
          console.error('Error generating payment link');
      }
  };

  if (loading || !booking) return <ActivityIndicator animating style={{marginTop: 50}} />;

  const isWorker = user.role === 'worker';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={`Booking Details - ${booking.status.toUpperCase()}`} />
        <Card.Content>
          <Text style={styles.text}><Text style={styles.bold}>Service:</Text> {booking.serviceType}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Location:</Text> {booking.location?.address}</Text>
          {booking.worker && <Text style={styles.text}><Text style={styles.bold}>Worker:</Text> {booking.worker.firstName}</Text>}

          <View style={styles.invoice}>
            <Title>Invoice Summary</Title>
            <Text style={styles.text}>Total Amount: ₱{booking.priceAtBooking}</Text>
            <Text style={styles.text}>Payment Status: {booking.paymentStatus.toUpperCase()}</Text>

            {!isWorker && booking.status === 'completed' && booking.paymentStatus === 'pending' && (
              <Button
                mode="contained"
                style={{marginTop: 10}}
                onPress={generatePaymentLink}
              >
                Pay ₱{booking.priceAtBooking} (PayMongo)
              </Button>
            )}
          </View>
        </Card.Content>
        {isWorker && booking.status !== 'completed' && booking.status !== 'cancelled' && (
          <Card.Actions style={styles.actions}>
            {booking.status === 'pending' && (
              <Button mode="contained" onPress={() => updateStatus('accepted')}>Accept Job</Button>
            )}
            {booking.status === 'accepted' && (
              <Button mode="contained" onPress={() => updateStatus('en_route')}>Mark En Route</Button>
            )}
            {booking.status === 'en_route' && (
              <Button mode="contained" onPress={() => updateStatus('completed')}>Mark Completed</Button>
            )}
          </Card.Actions>
        )}
      </Card>

      {(booking.status === 'accepted' || booking.status === 'en_route') && (
          <View style={styles.chatContainer}>
            <Title>Live Chat</Title>
            <ChatInterface bookingId={booking._id} />
          </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 15, backgroundColor: '#f5f5f5' },
  card: { marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 5 },
  bold: { fontWeight: 'bold' },
  invoice: { marginTop: 15, padding: 10, backgroundColor: '#e0f2f1', borderRadius: 5 },
  actions: { flexWrap: 'wrap', justifyContent: 'center' },
  chatContainer: { flex: 1, minHeight: 300, backgroundColor: '#fff', borderRadius: 8, padding: 10, elevation: 2 }
});

export default BookingDetailsScreen;
