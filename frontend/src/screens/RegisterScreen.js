import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { ToastContext } from '../contexts/ToastContext';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'customer' });
  const { register } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  const handleRegister = async () => {
    const res = await register(form);
    if (!res.success) {
      showToast(res.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#9ca3af" value={form.firstName} onChangeText={(t) => setForm({...form, firstName: t})} />
      <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#9ca3af" value={form.lastName} onChangeText={(t) => setForm({...form, lastName: t})} />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9ca3af" autoCapitalize="none" value={form.email} onChangeText={(t) => setForm({...form, email: t})} />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#9ca3af" secureTextEntry value={form.password} onChangeText={(t) => setForm({...form, password: t})} />

      <View style={styles.roleContainer}>
        <TouchableOpacity style={[styles.roleBtn, form.role === 'customer' && styles.roleActive]} onPress={() => setForm({...form, role: 'customer'})}>
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
  title: { fontSize: 32, color: '#10b981', fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#1f2937', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 15 },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  roleBtn: { flex: 1, padding: 15, backgroundColor: '#1f2937', borderRadius: 8, marginHorizontal: 5, alignItems: 'center' },
  roleActive: { backgroundColor: '#10b981' },
  roleText: { color: '#fff', fontWeight: 'bold' },
  btn: { backgroundColor: '#10b981', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#10b981', textAlign: 'center', marginTop: 20 }
});
