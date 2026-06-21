import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, TouchableOpacity, Easing } from 'react-native';
import { COLORS, FONTS, SPACING, ROUNDING } from '../theme';

const RadarLoader = ({ category, onCancel }) => {
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation loop
    const createPulse = (anim, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Rotation scanner loop
    const scannerRotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const animationGroup = Animated.parallel([
      createPulse(pulseAnim1, 0),
      createPulse(pulseAnim2, 1250),
      scannerRotation,
    ]);

    animationGroup.start();

    return () => {
      animationGroup.stop();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getPulseStyle = (anim) => ({
    opacity: anim.interpolate({
      inputRange: [0, 0.8, 1],
      outputRange: [0.6, 0.4, 0],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 2.5],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <View style={styles.radarContainer}>
        {/* Pulse Circles */}
        <Animated.View style={[styles.pulseCircle, getPulseStyle(pulseAnim1)]} />
        <Animated.View style={[styles.pulseCircle, getPulseStyle(pulseAnim2)]} />

        {/* Stationary Circular Rings */}
        <View style={[styles.ring, { width: 100, height: 100 }]} />
        <View style={[styles.ring, { width: 200, height: 200 }]} />
        <View style={[styles.ring, { width: 300, height: 300 }]} />

        {/* Rotating Radar Sweep */}
        <Animated.View style={[styles.sweep, { transform: [{ rotate: spin }] }]} />

        {/* Center Node (Customer) */}
        <View style={styles.centerNode}>
          <View style={styles.centerDot} />
          <View style={styles.centerPulse} />
        </View>

        {/* Nearby simulated worker nodes pulsing */}
        <View style={[styles.workerNode, { top: '25%', left: '30%' }]} />
        <View style={[styles.workerNode, { bottom: '30%', right: '25%' }]} />
        <View style={[styles.workerNode, { top: '40%', right: '35%' }]} />
      </View>

      {/* Booking Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.searchingText}>Searching for Nearby Pros</Text>
        <Text style={styles.categoryText}>Requesting {category} Partner...</Text>
        <Text style={styles.subtext}>Please wait while we match you with the closest provider.</Text>

        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  radarContainer: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sweep: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderTopColor: 'rgba(16, 185, 129, 0.4)',
    borderRightColor: 'rgba(16, 185, 129, 0.1)',
  },
  centerNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...COLORS.glassShadow,
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  centerPulse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
    transform: [{ scale: 1.5 }],
  },
  workerNode: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
  detailsContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  searchingText: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: '#fff',
    textAlign: 'center',
  },
  categoryText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
  cancelBtn: {
    marginTop: SPACING.xl,
    paddingVertical: 12,
    paddingHorizontal: SPACING.xl,
    borderRadius: ROUNDING.md,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  cancelBtnText: {
    color: '#ef4444',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});

export default RadarLoader;
