import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Title, Card, Button, Text, ActivityIndicator } from 'react-native-paper';
import api from '../api/axios';

const BookingHistoryScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.data);
    } catch (error) {
      console.log('Error fetching history', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBooking = ({ item }) => (
    <Card style={styles.card}>
      <Card.Title title={item.serviceType} subtitle={`Status: ${item.status}`} />
      <Card.Content>
        <Text>Location: {item.location?.address}</Text>
        <Text>Amount: ₱{item.priceAtBooking}</Text>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={() => navigation.navigate('BookingDetails', { bookingId: item._id })}>
          View
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator animating={true} style={{marginTop: 20}} /> : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBooking}
          ListEmptyComponent={<Text style={styles.empty}>No bookings found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  card: { marginBottom: 10 },
  empty: { textAlign: 'center', marginTop: 20, fontStyle: 'italic', color: 'gray' }
});

export default BookingHistoryScreen;
