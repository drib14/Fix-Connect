import React, { useState, useRef, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import api from '../api/axios';
import { ToastContext } from '../contexts/ToastContext';

export default function VerifyOTPScreen({ route, navigation }) {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const { showToast } = useContext(ToastContext);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleBackspace = (text, index) => {
    if (!text && index > 0) inputRefs.current[index - 1].focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) return showToast('Enter 6 digit OTP');
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp: code });
      if (data.success) {
        showToast('OTP verified');
        navigation.navigate('ResetPassword', { email, otp: code });
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace') handleBackspace(digit, index);
            }}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleVerify}>
        <Text style={styles.btnText}>Verify</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827', justifyContent: 'center', padding: 20 },
  logo: { width: 80, height: 80, alignSelf: 'center', marginBottom: 10 },
  title: { fontSize: 28, color: '#10b981', fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { color: '#9ca3af', textAlign: 'center', marginBottom: 30 },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, paddingHorizontal: 10 },
  otpInput: { width: 45, height: 55, backgroundColor: '#1f2937', color: '#fff', fontSize: 24, textAlign: 'center', borderRadius: 8 },
  btn: { backgroundColor: '#10b981', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
