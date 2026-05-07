import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import api from '../api/axios';

const ResetPasswordScreen = ({ route, navigation }) => {
  const { email, otp } = route.params;
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    try {
      setLoading(true);
      await api.post('/auth/reset-password', { email, otp, newPassword: password });
      alert('Password reset successfully');
      navigation.navigate('Auth');
    } catch (err) {
      alert('Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title>Reset Password</Title>
      <TextInput label="New Password" value={password} onChangeText={setPassword} secureTextEntry mode="outlined" style={styles.input} />
      <Button mode="contained" onPress={handleReset} loading={loading} disabled={!password}>
        Reset Password
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { marginBottom: 15 }
});

export default ResetPasswordScreen;
