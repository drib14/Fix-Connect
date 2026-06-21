import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, Animated, Dimensions } from 'react-native';
import { COLORS, FONTS } from '../theme';

const { width, height } = Dimensions.get('window');

const Splash = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.0,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Trigger onFinish after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Visual background circles for premium feel */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <View style={styles.logoContainer}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={{ opacity: textFadeAnim, alignItems: 'center' }}>
          <Text style={styles.title}>FixConnect</Text>
          <Text style={styles.subtitle}>On-Demand Services, Instantly</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: textFadeAnim }]}>
        <Text style={styles.footerText}>Securely Powered by Clerk</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  circle1: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    backgroundColor: '#047857',
    opacity: 0.15,
    top: -height * 0.25,
    left: -width * 0.1,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: '#10b981',
    opacity: 0.1,
    bottom: -height * 0.15,
    right: -width * 0.15,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 36,
    color: '#ffffff',
    fontFamily: FONTS.bold,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    opacity: 0.9,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    letterSpacing: 0.8,
  },
});

export default Splash;
