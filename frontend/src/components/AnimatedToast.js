import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence } from 'react-native-reanimated';

const AnimatedToast = forwardRef((props, ref) => {
  const [message, setMessage] = useState('');
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useImperativeHandle(ref, () => ({
    show: (msg) => {
      setMessage(msg);
      opacity.value = 1;
      translateY.value = withSequence(
        withSpring(50, { damping: 15, stiffness: 100 }),
        withTiming(50, { duration: 3000 }),
        withTiming(-100, { duration: 500 }, (isFinished) => {
          if (isFinished) opacity.value = 0;
        })
      );
    }
  }));

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }], opacity: opacity.value }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 20, right: 20, backgroundColor: '#10b981', padding: 15, borderRadius: 8, zIndex: 9999, elevation: 5 },
  text: { color: '#fff', fontWeight: 'bold', textAlign: 'center' }
});

export default AnimatedToast;
