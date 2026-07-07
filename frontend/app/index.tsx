import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { COLORS } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

/**
 * Animated Splash Screen
 * Displays the FixConnect logo with scale/opacity animation
 * while checking authentication state in the background.
 */
export default function SplashScreen() {
  const router = useRouter();
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslate = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Stage 1: Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Stage 2: Text entrance (staggered)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(subtitleTranslate, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    // Stage 3: Auth check and navigate
    const timer = setTimeout(async () => {
      const isValid = await checkAuth();
      if (isValid) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Subtle background circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* App Name */}
      <Animated.View
        style={{
          opacity: textOpacity,
          transform: [{ translateY: subtitleTranslate }],
        }}
      >
        <Text style={styles.appName}>
          Fix<Text style={styles.appNameAccent}>Connect</Text>
        </Text>
        <Text style={styles.tagline}>Your home services, one tap away</Text>
      </Animated.View>

      {/* Loading indicator */}
      <Animated.View style={[styles.loadingContainer, { opacity: textOpacity }]}>
        <View style={styles.loadingDot} />
        <View style={[styles.loadingDot, { opacity: 0.6 }]} />
        <View style={[styles.loadingDot, { opacity: 0.3 }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: COLORS.primary[100],
    opacity: 0.3,
    top: -width * 0.5,
    left: -width * 0.25,
  },
  bgCircle2: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: COLORS.primary[200],
    opacity: 0.2,
    bottom: -width * 0.2,
    right: -width * 0.2,
  },
  logoWrapper: {
    marginBottom: 24,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.primary[800],
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  appNameAccent: {
    color: COLORS.accent.DEFAULT,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.primary[600],
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    gap: 6,
    position: 'absolute',
    bottom: 80,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary[500],
  },
});
