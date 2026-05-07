import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Text, Button } from 'react-native-paper';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Title style={styles.title}>FixConnect</Title>
      <Text style={styles.subtitle}>Your on-demand service platform</Text>

      <Button mode="contained" style={styles.button} textColor="#00897b" onPress={() => navigation.navigate('Auth')}>
        Get Started
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00897b', padding: 20 },
  title: { fontSize: 40, color: 'white', fontWeight: 'bold' },
  subtitle: { fontSize: 18, color: 'white', marginBottom: 50 },
  button: { width: '100%', paddingVertical: 10, backgroundColor: 'white' }
});

export default WelcomeScreen;
