import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Title, Card } from 'react-native-paper';
import api from '../api/axios';

const BookingFormScreen = ({ navigation }) => {
  const [serviceType, setServiceType] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    try {
      setLoading(true);
      const res = await api.post('/bookings', {
        serviceType,
        location: {
          address,
          lat: 14.5995, // mocked Manila coordinates
          lng: 120.9842
        },
        priceAtBooking: 500 // Base mock price
      });
      navigation.navigate('BookingDetails', { bookingId: res.data.data._id });
    } catch (error) {
      console.log('Error creating booking', error);
      alert('Failed to book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title>Request a Service</Title>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Service Type (e.g. Plumber, Cleaning)"
            value={serviceType}
            onChangeText={setServiceType}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Your Address"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={2}
            mode="outlined"
            style={styles.input}
          />
          <Text style={styles.note}>A worker will be matched with you shortly.</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={handleBook} loading={loading} disabled={!serviceType || !address}>
            Confirm Booking
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: { paddingVertical: 10 },
  input: { marginBottom: 15 },
  note: { fontSize: 12, color: 'gray', fontStyle: 'italic', marginBottom: 10 }
});

export default BookingFormScreen;
