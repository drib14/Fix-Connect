import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import api from '../api/axios';
import { ToastContext } from '../contexts/ToastContext';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const { showToast } = useContext(ToastContext);

  const handleSendOTP = async () => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.success) {
        showToast('OTP sent to your email.');
        navigation.navigate('VerifyOTP', { email });
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email to receive a 6-digit OTP</Text>

      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9ca3af" autoCapitalize="none" value={email} onChangeText={setEmail} />

      <TouchableOpacity style={styles.btn} onPress={handleSendOTP}>
        <Text style={styles.btnText}>Send OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827', justifyContent: 'center', padding: 20 },
  logo: { width: 80, height: 80, alignSelf: 'center', marginBottom: 10 },
  title: { fontSize: 28, color: '#10b981', fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { color: '#9ca3af', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#1f2937', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 20 },
  btn: { backgroundColor: '#10b981', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#10b981', textAlign: 'center', marginTop: 20 }
});
