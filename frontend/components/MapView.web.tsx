import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

type MapViewProps = {
  userLocation?: { latitude: number; longitude: number } | null;
  providerLocation?: { lat: number; lon: number; bearing?: number } | null;
  height?: number;
};

export default function MapView({
  userLocation,
  providerLocation,
  height = 300,
}: MapViewProps) {
  return (
    <View style={[styles.webContainer, { height }]}>
      <View style={styles.webHeader}>
        <Ionicons name="map" size={24} color={COLORS.primary[600]} />
        <Text style={styles.webHeaderTitle}>FixConnect Live Radar Simulation</Text>
      </View>

      <View style={styles.simulationBody}>
        {/* Animated simulation map overlay */}
        <View style={styles.radarRing1} />
        <View style={styles.radarRing2} />

        {/* User Node */}
        {userLocation && (
          <View style={styles.userNode}>
            <View style={styles.nodeRipple} />
            <Ionicons name="person" size={18} color="#FFF" />
            <Text style={styles.nodeLabel}>You</Text>
          </View>
        )}

        {/* Provider Node */}
        {providerLocation ? (
          <View
            style={[
              styles.providerNode,
              {
                transform: [
                  { rotate: `${providerLocation.bearing || 0}deg` },
                ],
              },
            ]}
          >
            <View style={styles.providerRipple} />
            <Ionicons name="construct" size={18} color="#FFF" />
            <Text style={styles.nodeLabel}>Provider</Text>
          </View>
        ) : (
          <View style={styles.searchingBox}>
            <ActivityIndicator color={COLORS.primary[600]} style={{ marginRight: 8 }} />
            <Text style={styles.searchingText}>Awaiting booking placement...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.primary[200],
    padding: 16,
  },
  webHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  webHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary[800],
  },
  simulationBody: {
    flex: 1,
    backgroundColor: '#F1F8E9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  radarRing1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(76, 175, 80, 0.15)',
  },
  radarRing2: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1.5,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  userNode: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    position: 'absolute',
    top: '40%',
    left: '45%',
  },
  nodeRipple: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: COLORS.primary[400],
    opacity: 0.4,
  },
  providerNode: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    position: 'absolute',
    top: '30%',
    left: '25%',
  },
  providerRipple: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: COLORS.accent.light,
    opacity: 0.4,
  },
  nodeLabel: {
    position: 'absolute',
    bottom: -20,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text.primary,
    backgroundColor: '#FFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  searchingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    elevation: 3,
  },
  searchingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
});
