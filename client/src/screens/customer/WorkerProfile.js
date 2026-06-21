import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, ROUNDING } from '../../theme';

const WorkerProfile = ({ route, navigation }) => {
  const { worker, service } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image 
            source={{ uri: worker.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(worker.name) }} 
            style={styles.avatar} 
          />
          <Text style={styles.name}>{worker.name}</Text>
          <Text style={styles.categoryBadge}>{worker.workerDetails?.category || 'Service Partner'}</Text>
          
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStar}>★</Text>
            <Text style={styles.ratingText}>{worker.workerDetails?.rating?.toFixed(1) || '5.0'}</Text>
            <Text style={styles.ratingCount}>({worker.workerDetails?.ratingsCount || 0} customer reviews)</Text>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.bioText}>
            {worker.workerDetails?.bio || "No biography provided by the service worker."}
          </Text>
        </View>

        {/* Skills Section */}
        {worker.workerDetails?.skills && worker.workerDetails.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Specialities</Text>
            <View style={styles.skillsContainer}>
              {worker.workerDetails.skills.map((skill, index) => (
                <View key={`skill-${index}`} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Selected Service Card */}
        <View style={styles.serviceCard}>
          <Text style={styles.serviceLabel}>SELECTED SERVICE</Text>
          <Text style={styles.serviceTitle}>{service.name}</Text>
          <Text style={styles.serviceDescription}>{service.description}</Text>
          
          <View style={styles.serviceMetaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Duration</Text>
              <Text style={styles.metaVal}>{service.duration}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Price Est.</Text>
              <Text style={[styles.metaVal, styles.metaPrice]}>${service.price}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Booking Bar */}
      <View style={[styles.footerBar, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
        <View>
          <Text style={styles.footerPriceLabel}>Total Estimation</Text>
          <Text style={styles.footerPrice}>${service.price}</Text>
        </View>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => navigation.navigate('BookingScreen', { service, worker })}
        >
          <Text style={styles.bookButtonText}>Book Service</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: ROUNDING.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...COLORS.cardShadow,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  categoryBadge: {
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primaryDark,
    fontFamily: FONTS.bold,
    fontSize: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: ROUNDING.full,
    marginTop: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  ratingStar: {
    color: COLORS.warning,
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  ratingCount: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginLeft: 6,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: ROUNDING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...COLORS.cardShadow,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  bioText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  skillBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: ROUNDING.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
  },
  serviceCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: ROUNDING.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...COLORS.glassShadow,
  },
  serviceLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  serviceTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#fff',
    marginBottom: 6,
  },
  serviceDescription: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.primaryLight,
    opacity: 0.9,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  serviceMetaRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: SPACING.md,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  metaVal: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#fff',
    marginTop: 2,
  },
  metaPrice: {
    color: COLORS.primary,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerPriceLabel: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  footerPrice: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 12,
    borderRadius: ROUNDING.md,
    ...COLORS.glassShadow,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});

export default WorkerProfile;
