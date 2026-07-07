import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ServiceCategory } from '@/constants/services';
import { SHADOWS } from '@/constants/theme';

type ServiceCardProps = {
  service: ServiceCategory;
  onPress: (service: ServiceCategory) => void;
};

export function ServiceCard({ service, onPress }: ServiceCardProps) {
  return (
    <Pressable
      onPress={() => onPress(service)}
      style={({ pressed }) => [
        styles.container,
        SHADOWS.small,
        pressed && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={service.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconContainer}
      >
        <Ionicons name={service.icon} size={28} color="#FFF" />
      </LinearGradient>
      <Text style={styles.title} numberOfLines={1}>
        {service.title}
      </Text>
      <Text style={styles.description} numberOfLines={1}>
        {service.description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    width: '47%',
    marginBottom: 14,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  description: {
    fontSize: 10,
    color: '#757575',
    textAlign: 'center',
    marginTop: 2,
  },
});
