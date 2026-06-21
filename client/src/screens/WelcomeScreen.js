import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, SPACING, ROUNDING } from '../theme';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>FC</Text>
        </View>
        <Text style={styles.title}>FixConnect</Text>
        <Text style={styles.subtitle}>Connecting elite home service workers with customers in seconds.</Text>
      </View>

      <View style={styles.cardsContainer}>
        {/* Customer Choice Card */}
        <TouchableOpacity 
          style={[styles.card, styles.customerCard]} 
          onPress={() => navigation.navigate('CustomerAuth')}
          activeOpacity={0.9}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>CUSTOMER</Text>
          </View>
          <Text style={styles.cardTitle}>Hire a Professional</Text>
          <Text style={styles.cardDescription}>
            Find top-rated local professionals for plumbing, electrical, cleaning, repairs, and more.
          </Text>
          <View style={[styles.cardButton, styles.customerButton]}>
            <Text style={styles.cardButtonText}>Find Services</Text>
          </View>
        </TouchableOpacity>

        {/* Worker Choice Card */}
        <TouchableOpacity 
          style={[styles.card, styles.workerCard]} 
          onPress={() => navigation.navigate('WorkerAuth')}
          activeOpacity={0.9}
        >
          <View style={[styles.badge, styles.workerBadge]}>
            <Text style={styles.badgeText}>SERVICE PRO</Text>
          </View>
          <Text style={[styles.cardTitle, styles.workerText]}>Provide Services</Text>
          <Text style={[styles.cardDescription, styles.workerMutedText]}>
            Create your service profile, define your pricing, connect with local jobs, and grow your business.
          </Text>
          <View style={[styles.cardButton, styles.workerButton]}>
            <Text style={styles.cardButtonText}>Start Earning</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.footerText}>Secure authentication powered by Clerk</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...COLORS.glassShadow,
  },
  logoText: {
    color: '#fff',
    fontSize: 28,
    fontFamily: FONTS.bold,
  },
  title: {
    fontSize: 36,
    color: COLORS.secondary,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  cardsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: SPACING.md,
  },
  card: {
    borderRadius: ROUNDING.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    ...COLORS.cardShadow,
  },
  customerCard: {
    backgroundColor: '#fff',
    borderColor: COLORS.border,
  },
  workerCard: {
    backgroundColor: COLORS.secondary,
    borderColor: '#1e293b',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ROUNDING.sm,
    marginBottom: SPACING.sm,
  },
  workerBadge: {
    backgroundColor: '#334155',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  workerText: {
    color: '#fff',
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  workerMutedText: {
    color: '#94a3b8',
  },
  cardButton: {
    height: 40,
    borderRadius: ROUNDING.md,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  customerButton: {
    backgroundColor: COLORS.primary,
  },
  workerButton: {
    backgroundColor: '#fff',
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  workerButton: {
    backgroundColor: COLORS.primary,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    marginTop: SPACING.md,
  },
});

export default WelcomeScreen;
