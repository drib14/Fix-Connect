import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

import WelcomeScreen from '../screens/WelcomeScreen';
import AuthScreen from '../screens/AuthScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyOTPScreen from '../screens/VerifyOTPScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

import CustomerDashboard from '../screens/CustomerDashboard';
import WorkerDashboard from '../screens/WorkerDashboard';
import AdminDashboard from '../screens/AdminDashboard';
import BookingFormScreen from '../screens/BookingFormScreen';
import BookingDetailsScreen from '../screens/BookingDetailsScreen';
import BookingHistoryScreen from '../screens/BookingHistoryScreen';
import WorkerOnboardingScreen from '../screens/WorkerOnboardingScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00897b" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot Password' }} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} options={{ title: 'Verify OTP' }} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset Password' }} />
          </>
        ) : (
          <>
            {user.role === 'customer' && (
              <>
                <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} options={{ headerShown: false }} />
                <Stack.Screen name="BookingForm" component={BookingFormScreen} options={{ title: 'Request Service' }} />
                <Stack.Screen name="BookingHistory" component={BookingHistoryScreen} options={{ title: 'My Bookings' }} />
                <Stack.Screen name="WorkerOnboarding" component={WorkerOnboardingScreen} options={{ title: 'Become a Worker' }} />
              </>
            )}
            {user.role === 'worker' && (
              <Stack.Screen name="WorkerDashboard" component={WorkerDashboard} options={{ headerShown: false }} />
            )}
            {user.role === 'admin' && (
              <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ headerShown: false }} />
            )}

            {/* Common Authenticated Screens */}
            <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} options={{ title: 'Booking Details' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
