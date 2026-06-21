import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useFonts, 
  Outfit_400Regular, 
  Outfit_500Medium, 
  Outfit_600SemiBold, 
  Outfit_700Bold 
} from '@expo-google-fonts/outfit';
import * as SecureStore from 'expo-secure-store';

import { tokenCache } from './src/utils/tokenCache';
import { getApiClient } from './src/utils/api';
import useStore from './src/store/useStore';
import Splash from './src/components/Splash';
import WelcomeScreen from './src/screens/WelcomeScreen';
import CustomerAuthScreen from './src/screens/customer/CustomerAuthScreen';
import WorkerAuthScreen from './src/screens/worker/WorkerAuthScreen';
import { COLORS } from './src/theme';

// Customer screens
import CustomerHome from './src/screens/customer/CustomerHome';
import WorkerProfile from './src/screens/customer/WorkerProfile';
import BookingScreen from './src/screens/customer/BookingScreen';
import CustomerBookings from './src/screens/customer/CustomerBookings';

// Worker screens
import WorkerDashboard from './src/screens/worker/WorkerDashboard';
import WorkerBookings from './src/screens/worker/WorkerBookings';
import WorkerServices from './src/screens/worker/WorkerServices';

const queryClient = new QueryClient();
const Stack = createStackNavigator();

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('CRITICAL ERROR: EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not defined in environment variables.');
}

function CustomerStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: COLORS.secondary }, 
        headerTintColor: '#fff', 
        headerTitleStyle: { fontFamily: 'Outfit_600SemiBold' } 
      }}
    >
      <Stack.Screen name="CustomerHome" component={CustomerHome} options={{ headerShown: false }} />
      <Stack.Screen name="WorkerProfile" component={WorkerProfile} options={{ title: 'Worker Profile' }} />
      <Stack.Screen name="BookingScreen" component={BookingScreen} options={{ title: 'Book Service' }} />
      <Stack.Screen name="CustomerBookings" component={CustomerBookings} options={{ title: 'My Bookings', headerShown: false }} />
    </Stack.Navigator>
  );
}

function WorkerStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: COLORS.secondary }, 
        headerTintColor: '#fff', 
        headerTitleStyle: { fontFamily: 'Outfit_600SemiBold' } 
      }}
    >
      <Stack.Screen name="WorkerDashboard" component={WorkerDashboard} options={{ headerShown: false }} />
      <Stack.Screen name="WorkerBookings" component={WorkerBookings} options={{ title: 'Job Bookings', headerShown: false }} />
      <Stack.Screen name="WorkerServices" component={WorkerServices} options={{ title: 'My Services', headerShown: false }} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user, role, setUser } = useStore();
  const { user: clerkUser } = useUser();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    async function checkUserSync() {
      if (isLoaded && isSignedIn && !user && clerkUser) {
        setSyncing(true);
        try {
          const token = await getToken();
          console.log('[checkUserSync] Retrieved Clerk token:', token ? `${token.substring(0, 20)}... (length: ${token.length})` : 'NULL/EMPTY');
          const client = getApiClient(token);
          
          try {
            // Try fetching existing DB profile
            const response = await client.get('/auth/me');
            setUser(response.data);
          } catch (error) {
            // 404 indicates user exists in Clerk but not synced to MongoDB (e.g. social signup)
            if (error.response && error.response.status === 404) {
              console.log('User profile 404 in MongoDB. Auto-syncing profile...');
              let savedRole = 'customer';
              if (Platform.OS === 'web') {
                savedRole = localStorage.getItem('oauth_selected_role') || 'customer';
              } else {
                savedRole = await SecureStore.getItemAsync('oauth_selected_role') || 'customer';
              }
              
              const syncResponse = await client.post('/auth/sync', {
                email: clerkUser.primaryEmailAddress?.emailAddress,
                name: clerkUser.fullName || clerkUser.username || 'User',
                role: savedRole,
                avatar: clerkUser.imageUrl
              });
              setUser(syncResponse.data);
            } else {
              throw error;
            }
          }
        } catch (error) {
          console.error('Failed to sync profile to database:', error.message);
        } finally {
          setSyncing(false);
        }
      }
    }
    checkUserSync();
  }, [isLoaded, isSignedIn, clerkUser]);

  if (!isLoaded || syncing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isSignedIn || !user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="CustomerAuth" component={CustomerAuthScreen} />
          <Stack.Screen name="WorkerAuth" component={WorkerAuthScreen} />
        </Stack.Navigator>
      ) : role === 'worker' ? (
        <WorkerStack />
      ) : (
        <CustomerStack />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  const [isSplashActive, setIsSplashActive] = useState(true);
  
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  if (!fontsLoaded) {
    return null; // Keep displaying default shell splash until fonts are ready
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1 }}>
          <AppContent />
          {isSplashActive && (
            <Splash onFinish={() => setIsSplashActive(false)} />
          )}
        </View>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

