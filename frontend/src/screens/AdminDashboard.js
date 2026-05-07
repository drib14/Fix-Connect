import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Title, Card, Button, Text, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/axios';

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
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
      console.log('Error fetching bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBooking = ({ item }) => (
    <Card style={styles.card}>
      <Card.Title title={`Booking ID: ${item._id.substring(0,8)}`} subtitle={`Status: ${item.status}`} />
      <Card.Content>
        <Text>Service: {item.serviceType}</Text>
        <Text>Total Amount: ₱{item.priceAtBooking}</Text>
        <Text>Payment: {item.paymentStatus}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>Admin Overview</Title>
        <Button mode="outlined" onPress={logout}>Logout</Button>
      </View>
      <Title style={styles.subTitle}>All Platform Bookings</Title>
      {loading ? <ActivityIndicator animating={true} style={{marginTop: 20}} /> : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBooking}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#eceff1' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  subTitle: { fontSize: 18, marginBottom: 10 },
  card: { marginBottom: 10 }
});

export default AdminDashboard;
