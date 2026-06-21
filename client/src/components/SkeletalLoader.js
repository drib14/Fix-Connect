import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { COLORS } from '../theme';

const SkeletalLoader = ({ type = 'card', count = 1 }) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, []);

  const renderCard = (index) => (
    <View key={`skeleton-card-${index}`} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarPlaceholder} />
        <View style={styles.headerTextContainer}>
          <View style={styles.lineMedium} />
          <View style={styles.lineSmall} />
        </View>
      </View>
      <View style={styles.bodyPlaceholder} />
      <View style={styles.cardFooter}>
        <View style={styles.lineSmall} />
        <View style={styles.buttonPlaceholder} />
      </View>
    </View>
  );

  const renderList = (index) => (
    <View key={`skeleton-list-${index}`} style={styles.listItem}>
      <View style={styles.thumbnailPlaceholder} />
      <View style={styles.listTextContainer}>
        <View style={styles.lineLarge} />
        <View style={[styles.lineMedium, { marginTop: 8 }]} />
        <View style={[styles.lineSmall, { marginTop: 8 }]} />
      </View>
    </View>
  );

  const renderProfile = () => (
    <View style={styles.profileContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.largeAvatarPlaceholder} />
        <View style={[styles.lineMedium, { marginTop: 16 }]} />
        <View style={[styles.lineSmall, { marginTop: 8 }]} />
      </View>
      <View style={styles.profileBody}>
        <View style={styles.lineLarge} />
        <View style={[styles.lineLarge, { marginTop: 12 }]} />
        <View style={[styles.lineMedium, { marginTop: 12 }]} />
      </View>
    </View>
  );

  const renderGrid = (index) => (
    <View key={`skeleton-grid-${index}`} style={styles.gridItem}>
      <View style={styles.gridSquare} />
      <View style={[styles.lineSmall, { marginTop: 8, alignSelf: 'center' }]} />
    </View>
  );

  const items = Array.from({ length: count });

  return (
    <Animated.View style={{ opacity: pulseAnim, width: '100%' }}>
      {type === 'card' && items.map((_, i) => renderCard(i))}
      {type === 'list' && items.map((_, i) => renderList(i))}
      {type === 'profile' && renderProfile()}
      {type === 'grid' && (
        <View style={styles.gridContainer}>
          {items.map((_, i) => renderGrid(i))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Card styles
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  lineMedium: {
    height: 14,
    backgroundColor: COLORS.border,
    borderRadius: 7,
    width: '60%',
  },
  lineSmall: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    width: '40%',
    marginTop: 6,
  },
  lineLarge: {
    height: 14,
    backgroundColor: COLORS.border,
    borderRadius: 7,
    width: '85%',
  },
  bodyPlaceholder: {
    height: 60,
    backgroundColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonPlaceholder: {
    width: 80,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
  },

  // List styles
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  listTextContainer: {
    marginLeft: 12,
    flex: 1,
  },

  // Grid styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 4,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  gridSquare: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },

  // Profile styles
  profileContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  largeAvatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.border,
  },
  profileBody: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 20,
  },
});

export default SkeletalLoader;
