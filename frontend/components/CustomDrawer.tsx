import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { useAuthStore } from '@/store/useAuthStore';

type CustomDrawerProps = {
  visible: boolean;
  onClose: () => void;
  onPromoPress: () => void;
  onHelpPress: () => void;
  onAboutPress: () => void;
};

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = Platform.OS === 'web' ? 300 : width * 0.78;

export default function CustomDrawer({
  visible,
  onClose,
  onPromoPress,
  onHelpPress,
  onAboutPress,
}: CustomDrawerProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleNavigate = (path: string) => {
    onClose();
    // Delay routing briefly to let drawer close animation complete smoothly
    setTimeout(() => {
      router.push(path as any);
    }, 150);
  };

  const handleAction = (callback: () => void) => {
    onClose();
    setTimeout(() => {
      callback();
    }, 150);
  };

  const handleLogout = async () => {
    onClose();
    setTimeout(async () => {
      await logout();
      router.replace('/(auth)/login');
    }, 150);
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={styles.container}>
        {/* Animated backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={styles.backdropPressable} onPress={onClose} />
        </Animated.View>

        {/* Sliding Panel */}
        <Animated.View
          style={[
            styles.drawerPanel,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {/* User Profile Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.avatarContainer}>
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.name || 'FixConnect User'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || 'user@fixconnect.com'}
              </Text>
            </View>
          </View>

          {/* Drawer Menu Items */}
          <View style={styles.menuItems}>
            <Text style={styles.menuSectionHeader}>Navigation</Text>
            
            <Pressable style={styles.menuItem} onPress={() => handleNavigate('/(tabs)')}>
              <Ionicons name="home-outline" size={22} color={COLORS.primary[700]} />
              <Text style={styles.menuItemLabel}>Home Dashboard</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => handleNavigate('/(tabs)/bookings')}>
              <Ionicons name="calendar-outline" size={22} color={COLORS.primary[700]} />
              <Text style={styles.menuItemLabel}>My Bookings</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => handleNavigate('/(tabs)/inbox')}>
              <Ionicons name="chatbubbles-outline" size={22} color={COLORS.primary[700]} />
              <Text style={styles.menuItemLabel}>Inbox Messages</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => handleNavigate('/(tabs)/profile')}>
              <Ionicons name="person-outline" size={22} color={COLORS.primary[700]} />
              <Text style={styles.menuItemLabel}>My Profile</Text>
            </Pressable>

            <View style={styles.divider} />

            <Text style={styles.menuSectionHeader}>Promos & Info</Text>

            <Pressable style={styles.menuItem} onPress={() => handleAction(onPromoPress)}>
              <Ionicons name="pricetag-outline" size={22} color={COLORS.primary[700]} />
              <Text style={styles.menuItemLabel}>Apply Promo Code</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => handleAction(onHelpPress)}>
              <Ionicons name="help-circle-outline" size={22} color={COLORS.primary[700]} />
              <Text style={styles.menuItemLabel}>Help & Support</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => handleAction(onAboutPress)}>
              <Ionicons name="information-circle-outline" size={22} color={COLORS.primary[700]} />
              <Text style={styles.menuItemLabel}>About Platform</Text>
            </Pressable>
          </View>

          {/* Footer Action */}
          <View style={styles.drawerFooter}>
            <Pressable style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color={COLORS.status.CANCELLED} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  backdropPressable: {
    flex: 1,
  },
  drawerPanel: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
    zIndex: 100,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 14,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary[800],
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  menuItems: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  menuSectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.light,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 4,
  },
  menuItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 18,
  },
  drawerFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.status.CANCELLED,
  },
});
