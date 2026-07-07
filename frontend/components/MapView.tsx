import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import MapViewComponent, { Marker as MarkerComponent } from 'react-native-maps';

type MapViewProps = {
  userLocation?: { latitude: number; longitude: number } | null;
  providerLocation?: { lat: number; lon: number; bearing?: number } | null;
  height?: number;
};

/**
 * Native MapView implementation using react-native-maps.
 * Only resolved/bundled on native platforms (iOS/Android).
 */
export default function MapView({
  userLocation,
  providerLocation,
  height = 300,
}: MapViewProps) {
  const centerLatitude = userLocation?.latitude || 14.5995;
  const centerLongitude = userLocation?.longitude || 120.9842;

  return (
    <View style={[styles.container, { height }]}>
      <MapViewComponent
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: centerLatitude,
          longitude: centerLongitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
      >
        {userLocation && (
          <MarkerComponent
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            pinColor={COLORS.primary[500]}
          />
        )}

        {providerLocation && (
          <MarkerComponent
            coordinate={{
              latitude: providerLocation.lat,
              longitude: providerLocation.lon,
            }}
            title="Provider Location"
          >
            <View style={styles.providerMarker}>
              <Ionicons name="construct" size={18} color="#FFF" />
            </View>
          </MarkerComponent>
        )}
      </MapViewComponent>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  providerMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFF',
  },
});
