import React, { useContext } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthContext } from "../context/AuthContext";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";

import HomeScreen from "../screens/customer/HomeScreen";
import ActivityScreen from "../screens/customer/ActivityScreen";
import ProfileScreen from "../screens/common/ProfileScreen";
import ProviderDashboardScreen from "../screens/provider/ProviderDashboardScreen";

import { Home, Clock, User, Wrench } from "lucide-react-native";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Customer Bottom Tab Router
function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#22C55E", // Green theme for Customer
        tabBarInactiveTintColor: "#64748B",
      }}
    >
      <Tab.Screen
        name="CustomerHome"
        component={HomeScreen}
        options={{
          tabBarLabel: "Book Now",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="CustomerActivity"
        component={ActivityScreen}
        options={{
          tabBarLabel: "Activity",
          tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="CustomerProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Provider Bottom Tab Router
function ProviderTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#F97316", // Accent Orange theme for Provider
        tabBarInactiveTintColor: "#64748B",
      }}
    >
      <Tab.Screen
        name="ProviderDashboard"
        component={ProviderDashboardScreen}
        options={{
          tabBarLabel: "Dispatches",
          tabBarIcon: ({ color, size }) => <Wrench color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ProviderActivity"
        component={ActivityScreen}
        options={{
          tabBarLabel: "History",
          tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ProviderProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, token, activeRole, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        ) : activeRole === "provider" ? (
          // Provider Stack
          <Stack.Screen name="ProviderMain" component={ProviderTabs} />
        ) : (
          // Customer Stack
          <Stack.Screen name="CustomerMain" component={CustomerTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0B1510",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    backgroundColor: "#11221A",
    borderTopWidth: 1,
    borderTopColor: "#1E3A2F",
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
});
