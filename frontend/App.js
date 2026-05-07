import 'react-native-gesture-handler';
import React from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { SocketProvider } from './src/contexts/SocketContext';
import AppNavigator from './src/navigation/AppNavigator';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#00897b',
    accent: '#004d40',
  },
};

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <PaperProvider theme={theme}>
          <AppNavigator />
        </PaperProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
