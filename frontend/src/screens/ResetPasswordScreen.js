import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import api from '../api/axios';
import { ToastContext } from '../contexts/ToastContext';
import { Eye, EyeOff } from 'lucide-react-native';

export default function ResetPasswordScreen({ route, navigation }) {
  const { email, otp } = route.params;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useContext(ToastContext);

  const handleReset = async () => {
    try {
      const { data } = await api.post('/auth/reset-password', { email, otp, newPassword: password });
      if (data.success) {
        showToast('Password reset successful. Please login.');
        navigation.navigate('Login');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Reset Password</Text>

      <View style={styles.pwdContainer}>
        <TextInput style={styles.pwdInput} placeholder="New Password" placeholderTextColor="#9ca3af" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          {showPassword ? <EyeOff color="#9ca3af" size={20} /> : <Eye color="#9ca3af" size={20} />}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleReset}>
        <Text style={styles.btnText}>Set New Password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827', justifyContent: 'center', padding: 20 },
  logo: { width: 80, height: 80, alignSelf: 'center', marginBottom: 10 },
  title: { fontSize: 28, color: '#10b981', fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  pwdContainer: { flexDirection: 'row', backgroundColor: '#1f2937', borderRadius: 8, marginBottom: 20, alignItems: 'center' },
  pwdInput: { flex: 1, color: '#fff', padding: 15 },
  eyeIcon: { padding: 15 },
  btn: { backgroundColor: '#10b981', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
