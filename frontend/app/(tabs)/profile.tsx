import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { ProfileSkeleton } from '@/components/SkeletonLoader';
import { COLORS, SHADOWS } from '@/constants/theme';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  color: string;
  onPress?: () => void;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'person-outline',
      label: 'Edit Profile',
      subtitle: 'Update your name, phone, and photo',
      color: COLORS.primary[500],
    },
    {
      icon: 'card-outline',
      label: 'Payment Methods',
      subtitle: 'Manage GCash, Maya, and card details',
      color: '#42A5F5',
    },
    {
      icon: 'location-outline',
      label: 'Saved Addresses',
      subtitle: 'Home, office, and other locations',
      color: '#7E57C2',
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Security',
      subtitle: 'Change password and login options',
      color: '#26A69A',
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      subtitle: 'Push notification preferences',
      color: '#FFA726',
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      subtitle: 'FAQs, contact us, report an issue',
      color: '#EC407A',
    },
    {
      icon: 'information-circle-outline',
      label: 'About FixConnect',
      subtitle: 'Version 1.0.0 • Terms & Privacy',
      color: COLORS.text.secondary,
    },
  ];

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, SHADOWS.medium]}>
          <View style={styles.avatarWrapper}>
            {user.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Pressable style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={14} color="#FFF" />
            </Pressable>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <Text style={styles.profilePhone}>{user.phone}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: '#F0F0F0' },
              ]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.text.light} />
            </Pressable>
          ))}
        </View>

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.status.CANCELLED} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 24,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 3,
  },
  profilePhone: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  menuSection: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 14,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  menuSubtitle: {
    fontSize: 11,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: COLORS.status.CANCELLED + '30',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.status.CANCELLED,
  },
});
