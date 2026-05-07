import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title, Text } from 'react-native-paper';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/axios';

const WorkerOnboardingScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBecomeWorker = async () => {
    try {
      setLoading(true);
      await api.put('/auth/become-worker', { category });
      alert('You are now registered as a worker! Please re-login.');
      logout();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title>Become a Worker</Title>
      <Text style={{marginBottom: 20}}>Provide the service category you offer to start accepting jobs.</Text>
      <TextInput
        label="Service Category (e.g. Plumber, Electrician)"
        value={category}
        onChangeText={setCategory}
        mode="outlined"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleBecomeWorker} loading={loading} disabled={!category}>
        Submit
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { marginBottom: 15 }
});

export default WorkerOnboardingScreen;
