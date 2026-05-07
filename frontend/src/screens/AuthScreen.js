import React, { useState, useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, Title } from 'react-native-paper';
import { AuthContext } from '../contexts/AuthContext';

const AuthScreen = ({ navigation }) => {
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setError('');
      if (isLogin) {
        await login(email, password);
      } else {
        await register({
          email, password, firstName, lastName, role: 'customer' // Default to customer
        });
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>FixConnect</Title>

      <SegmentedButtons
        value={isLogin ? 'login' : 'register'}
        onValueChange={(val) => setIsLogin(val === 'login')}
        buttons={[
          { value: 'login', label: 'Login' },
          { value: 'register', label: 'Register' }
        ]}
        style={styles.segmented}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!isLogin && (
        <>
          <TextInput label="First Name" value={firstName} onChangeText={setFirstName} mode="outlined" style={styles.input} />
          <TextInput label="Last Name" value={lastName} onChangeText={setLastName} mode="outlined" style={styles.input} />
        </>
      )}

      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" mode="outlined" style={styles.input} />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry mode="outlined" style={styles.input} />

      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        {isLogin ? 'Login' : 'Register'}
      </Button>

      {isLogin && (
         <Button mode="text" onPress={() => navigation.navigate('ForgotPassword')} style={{marginTop: 10}}>
            Forgot Password?
         </Button>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  title: { textAlign: 'center', fontSize: 28, marginBottom: 20 },
  segmented: { marginBottom: 15 },
  input: { marginBottom: 10 },
  button: { marginTop: 10, paddingVertical: 5 },
  error: { color: 'red', textAlign: 'center', marginBottom: 10 }
});

export default AuthScreen;
