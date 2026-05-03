import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { ToastContext } from '../contexts/ToastContext';
import { Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  const handleLogin = async () => {
    const res = await login(email, password);
    if (!res.success) showToast(res.message);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>FixConnect</Text>

      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9ca3af" autoCapitalize="none" value={email} onChangeText={setEmail} />

      <View style={styles.pwdContainer}>
        <TextInput style={styles.pwdInput} placeholder="Password" placeholderTextColor="#9ca3af" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          {showPassword ? <EyeOff color="#9ca3af" size={20} /> : <Eye color="#9ca3af" size={20} />}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotBtn}>
        <Text style={styles.forgotTxt}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827', justifyContent: 'center', padding: 20 },
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 10 },
  title: { fontSize: 28, color: '#10b981', fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#1f2937', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 15 },
  pwdContainer: { flexDirection: 'row', backgroundColor: '#1f2937', borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  pwdInput: { flex: 1, color: '#fff', padding: 15 },
  eyeIcon: { padding: 15 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotTxt: { color: '#10b981' },
  btn: { backgroundColor: '#10b981', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#10b981', textAlign: 'center', marginTop: 20 }
});
