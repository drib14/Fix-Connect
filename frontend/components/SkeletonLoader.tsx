import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SkeletonLoaderProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  variant?: 'rectangle' | 'circle' | 'text';
};

/**
 * Dynamic Skeleton Loader with shimmer animation.
 * Mirrors the geometry of the target component while data loads.
 */
export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  variant = 'rectangle',
}: SkeletonLoaderProps) {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  const resolvedStyles = {
    width: variant === 'circle' ? height : width,
    height,
    borderRadius: variant === 'circle' ? height / 2 : borderRadius,
  };

  return (
    <View style={[styles.container, resolvedStyles, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
}

/**
 * Pre-built skeleton layouts for common card types.
 */
export function ServiceCardSkeleton() {
  return (
    <View style={styles.serviceCard}>
      <SkeletonLoader variant="circle" height={56} />
      <View style={{ marginTop: 10, alignItems: 'center' }}>
        <SkeletonLoader width={60} height={12} borderRadius={4} />
        <SkeletonLoader width={40} height={10} borderRadius={4} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

export function BookingCardSkeleton() {
  return (
    <View style={styles.bookingCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <SkeletonLoader variant="circle" height={44} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <SkeletonLoader width="70%" height={14} borderRadius={4} />
          <SkeletonLoader width="50%" height={11} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
        <SkeletonLoader width={60} height={24} borderRadius={12} />
      </View>
      <View style={{ marginTop: 14 }}>
        <SkeletonLoader width="90%" height={11} borderRadius={4} />
        <SkeletonLoader width="60%" height={11} borderRadius={4} style={{ marginTop: 6 }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
        <SkeletonLoader width={80} height={11} borderRadius={4} />
        <SkeletonLoader width={60} height={14} borderRadius={4} />
      </View>
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 24 }}>
      <SkeletonLoader variant="circle" height={80} />
      <SkeletonLoader width={120} height={16} borderRadius={4} style={{ marginTop: 16 }} />
      <SkeletonLoader width={160} height={12} borderRadius={4} style={{ marginTop: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  serviceCard: {
    width: 90,
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
});
