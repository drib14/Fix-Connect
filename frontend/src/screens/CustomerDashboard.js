import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Card, Button, Text } from 'react-native-paper';
import { AuthContext } from '../contexts/AuthContext';

const CustomerDashboard = ({ navigation }) => {
  const { logout, user } = useContext(AuthContext);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Title>Welcome, {user?.firstName || 'Customer'}</Title>
        <Button mode="outlined" onPress={logout}>Logout</Button>
      </View>

      <Card style={styles.card}>
        <Card.Title title="Request a Service" subtitle="Find a worker near you instantly" />
        <Card.Content>
          <Text style={{marginBottom: 10}}>We'll match you with the best available worker for your specific needs.</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => navigation.navigate('BookingForm')}>
            Start Booking
          </Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="My Bookings" subtitle="View your past and active bookings" />
        <Card.Actions>
          <Button mode="contained" onPress={() => navigation.navigate('BookingHistory')}>
            View History
          </Button>
        </Card.Actions>
      </Card>

      {user.role !== 'worker' && (
        <Button
          mode="text"
          style={{marginTop: 20}}
          onPress={() => navigation.navigate('WorkerOnboarding')}
        >
          Become a Worker
        </Button>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 15, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, marginTop: 20 },
  card: { marginBottom: 15 }
});

export default CustomerDashboard;
