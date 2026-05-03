import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { ToastContext } from '../contexts/ToastContext';
import { Eye, EyeOff } from 'lucide-react-native';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'customer' });
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  const handleRegister = async () => {
    const res = await register(form);
    if (!res.success) showToast(res.message);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Join FixConnect</Text>

      <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#9ca3af" value={form.firstName} onChangeText={(t) => setForm({...form, firstName: t})} />
      <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#9ca3af" value={form.lastName} onChangeText={(t) => setForm({...form, lastName: t})} />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9ca3af" autoCapitalize="none" value={form.email} onChangeText={(t) => setForm({...form, email: t})} />

      <View style={styles.pwdContainer}>
        <TextInput style={styles.pwdInput} placeholder="Password" placeholderTextColor="#9ca3af" secureTextEntry={!showPassword} value={form.password} onChangeText={(t) => setForm({...form, password: t})} />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          {showPassword ? <EyeOff color="#9ca3af" size={20} /> : <Eye color="#9ca3af" size={20} />}
        </TouchableOpacity>
      </View>

      <View style={styles.roleContainer}>
        <TouchableOpacity style={[styles.roleBtn, form.role === 'customer' && styles.roleActive]} onPress={() => setForm({...form, role: 'customer', category: ''})}>
          <Text style={styles.roleText}>Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.roleBtn, form.role === 'worker' && styles.roleActive]} onPress={() => setForm({...form, role: 'worker'})}>
          <Text style={styles.roleText}>Worker</Text>
        </TouchableOpacity>
      </View>

      {form.role === 'worker' && (
        <TextInput style={styles.input} placeholder="Category (e.g. Plumber)" placeholderTextColor="#9ca3af" value={form.category} onChangeText={(t) => setForm({...form, category: t})} />
      )}

      <TouchableOpacity style={styles.btn} onPress={handleRegister}>
        <Text style={styles.btnText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#111827', justifyContent: 'center', padding: 20 },
  logo: { width: 80, height: 80, alignSelf: 'center', marginBottom: 10 },
  title: { fontSize: 28, color: '#10b981', fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#1f2937', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 15 },
  pwdContainer: { flexDirection: 'row', backgroundColor: '#1f2937', borderRadius: 8, marginBottom: 15, alignItems: 'center' },
  pwdInput: { flex: 1, color: '#fff', padding: 15 },
  eyeIcon: { padding: 15 },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  roleBtn: { flex: 1, padding: 15, backgroundColor: '#1f2937', borderRadius: 8, marginHorizontal: 5, alignItems: 'center' },
  roleActive: { backgroundColor: '#10b981' },
  roleText: { color: '#fff', fontWeight: 'bold' },
  btn: { backgroundColor: '#10b981', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#10b981', textAlign: 'center', marginTop: 20 }
});
