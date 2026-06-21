import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Platform } from 'react-native';
import { COLORS, FONTS, SPACING, ROUNDING } from '../theme';

const ServiceMap = ({ customerCoords, workerCoords, status }) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  // Animate worker towards customer based on status
  useEffect(() => {
    let toValue = 0;
    if (status === 'accepted') toValue = 0.25;
    else if (status === 'arrived') toValue = 0.95;
    else if (status === 'in_progress') toValue = 1.0;
    else if (status === 'completed') toValue = 1.0;

    Animated.timing(animatedProgress, {
      toValue,
      duration: 5000, // 5 seconds smooth transition
      useNativeDriver: false, // coordinates translation doesn't support native driver in layout positioning
    }).start();
  }, [status]);

  if (Platform.OS === 'web') {
    // Generate Leaflet OpenStreetMap in an iframe
    // Leaflet URL uses OpenStreetMap with markers for customer and worker
    const custLat = customerCoords?.[1] || 14.5995;
    const custLng = customerCoords?.[0] || 120.9842;
    const workLat = workerCoords?.[1] || 14.6010;
    const workLng = workerCoords?.[0] || 120.9890;

    const mapHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; font-family: sans-serif; background-color: #0f172a; }
          .marker-label { background: #0f172a; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold; border: 1px solid #10b981; font-size: 10px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: false }).setView([${(custLat + workLat) / 2}, ${(custLng + workLng) / 2}], 15);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: 'OpenStreetMap'
          }).addTo(map);

          // Add Customer Marker
          const customerMarker = L.marker([${custLat}, ${custLng}]).addTo(map);
          customerMarker.bindTooltip("Your Location", { permanent: true, direction: 'top', className: 'marker-label' }).openTooltip();

          // Add Worker Marker
          const workerMarker = L.marker([${workLat}, ${workLng}]).addTo(map);
          workerMarker.bindTooltip("Service Partner", { permanent: true, direction: 'top', className: 'marker-label' }).openTooltip();

          // Add routing line
          const polyline = L.polyline([[${workLat}, ${workLng}], [${custLat}, ${custLng}]], {
            color: '#10b981',
            weight: 3,
            dashArray: '5, 10'
          }).addTo(map);

          map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
        </script>
      </body>
      </html>
    `;

    return (
      <View style={styles.webContainer}>
        <iframe
          title="Service Location Map"
          srcDoc={mapHtml}
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: ROUNDING.md }}
        />
      </View>
    );
  }

  // Simulated Animated High-Tech Map for Native
  const pathX = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['15%', '85%'],
  });

  const pathY = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['20%', '80%'],
  });

  return (
    <View style={styles.nativeContainer}>
      {/* Grid Pattern */}
      <View style={styles.gridOverlay}>
        <View style={styles.gridRow} />
        <View style={styles.gridRow} />
        <View style={styles.gridRow} />
        <View style={styles.gridRow} />
      </View>

      {/* Dotted Route Line */}
      <View style={styles.routeLine} />

      {/* Customer Marker (Static Destination) */}
      <View style={[styles.markerNode, styles.customerNode]}>
        <Text style={styles.markerEmoji}>🏠</Text>
        <Text style={styles.markerLabel}>You</Text>
      </View>

      {/* Worker Marker (Animated Source) */}
      <Animated.View style={[styles.markerNode, styles.workerNode, { left: pathX, top: pathY }]}>
        <Text style={styles.markerEmoji}>🛠️</Text>
        <Text style={styles.markerLabel}>Partner</Text>
      </Animated.View>

      {/* Status HUD Panel */}
      <View style={styles.hudPanel}>
        <Text style={styles.hudTitle}>Proximity Tracking</Text>
        <Text style={styles.hudSub}>
          {status === 'accepted' && 'Partner is navigating to your house'}
          {status === 'arrived' && 'Partner is at your address'}
          {status === 'in_progress' && 'Partner has started service'}
          {status === 'completed' && 'Service Completed!'}
          {status === 'finding_provider' && 'Connecting...'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: ROUNDING.md,
    overflow: 'hidden',
  },
  nativeContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: ROUNDING.md,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  gridOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'space-around',
    opacity: 0.1,
  },
  gridRow: {
    height: 1,
    backgroundColor: '#fff',
    width: '100%',
  },
  routeLine: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    transform: [{ rotate: '45deg' }],
    top: '-10%',
    left: '-10%',
  },
  markerNode: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  customerNode: {
    right: '15%',
    bottom: '20%',
  },
  workerNode: {
    zIndex: 10,
  },
  markerEmoji: {
    fontSize: 26,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  markerLabel: {
    color: '#fff',
    fontSize: 9,
    fontFamily: FONTS.bold,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: ROUNDING.sm,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hudPanel: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: ROUNDING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#334155',
  },
  hudTitle: {
    color: COLORS.primary,
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  hudSub: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginTop: 2,
  },
});

export default ServiceMap;
