import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title, Text } from 'react-native-paper';
import api from '../api/axios';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email });
      alert('OTP sent to your email');
      navigation.navigate('VerifyOTP', { email });
    } catch (err) {
      alert('Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title>Forgot Password</Title>
      <Text style={{marginBottom: 20}}>Enter your email to receive a 6-digit OTP.</Text>
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" mode="outlined" style={styles.input} />
      <Button mode="contained" onPress={handleSendOTP} loading={loading} disabled={!email}>
        Send OTP
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { marginBottom: 15 }
});

export default ForgotPasswordScreen;
