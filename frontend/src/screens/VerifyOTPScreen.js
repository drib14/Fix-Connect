import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import api from '../api/axios';

const VerifyOTPScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    try {
      setLoading(true);
      await api.post('/auth/verify-otp', { email, otp });
      navigation.navigate('ResetPassword', { email, otp });
    } catch (err) {
      alert('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title>Verify OTP</Title>
      <TextInput label="6-Digit OTP" value={otp} onChangeText={setOtp} keyboardType="numeric" mode="outlined" style={styles.input} />
      <Button mode="contained" onPress={handleVerify} loading={loading} disabled={otp.length !== 6}>
        Verify
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { marginBottom: 15 }
});

export default VerifyOTPScreen;
