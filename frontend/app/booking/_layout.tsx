import React from 'react';
import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        contentStyle: { backgroundColor: '#F5F5F5' },
      }}
    >
      <Stack.Screen name="setup" />
      <Stack.Screen name="matching" options={{ gestureEnabled: false }} />
      <Stack.Screen name="active" options={{ gestureEnabled: false }} />
      <Stack.Screen name="completion" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
