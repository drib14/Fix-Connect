import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ScrollView 
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';
import { COLORS, FONTS, SPACING, ROUNDING } from '../../theme';
import { getApiClient } from '../../utils/api';
import useStore from '../../store/useStore';
import SkeletalLoader from '../../components/SkeletalLoader';

const CATEGORIES = [
  { id: '1', name: 'Plumbing', icon: '🚰' },
  { id: '2', name: 'Electrical', icon: '⚡' },
  { id: '3', name: 'Cleaning', icon: '🧹' },
  { id: '4', name: 'AC Repair', icon: '❄️' },
  { id: '5', name: 'Carpentry', icon: '🪚' },
  { id: '6', name: 'Painting', icon: '🎨' },
];

const CustomerHome = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const { getToken, signOut } = useAuth();
  const { user, setRole, logout } = useStore();

  // Query for fetching services/workers
  const { data: services, isLoading, refetch } = useQuery({
    queryKey: ['services', selectedCategory, search],
    queryFn: async () => {
      const token = await getToken();
      const client = getApiClient(token);
      let path = '/services';
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (search) params.search = search;
      
      const response = await client.get(path, { params });
      return response.data;
    }
  });

  const handleCategoryPress = (categoryName) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null); // toggle off
    } else {
      setSelectedCategory(categoryName);
    }
  };

  const handleLogout = async () => {
    await signOut();
    logout();
  };

  const handleRoleSwitch = async () => {
    try {
      const token = await getToken();
      const client = getApiClient(token);
      const updatedRole = user.role === 'customer' ? 'worker' : 'customer';
      
      const response = await client.post('/auth/role', { role: updatedRole });
      setRole(response.data.role);
      
      // Update local storage store
      useStore.getState().setUser(response.data);
    } catch (error) {
      console.error('Failed to switch role:', error.message);
    }
  };

  const renderWorkerCard = ({ item }) => {
    const worker = item.worker;
    if (!worker) return null;

    return (
      <TouchableOpacity 
        style={styles.workerCard}
        onPress={() => navigation.navigate('WorkerProfile', { worker, service: item })}
      >
        <Image 
          source={{ uri: worker.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(worker.name) }} 
          style={styles.avatar} 
        />
        <View style={styles.cardDetails}>
          <Text style={styles.categoryBadge}>{item.category}</Text>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.workerName}>By {worker.name}</Text>
          
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStar}>★</Text>
            <Text style={styles.ratingText}>{worker.workerDetails?.rating?.toFixed(1) || '5.0'}</Text>
            <Text style={styles.ratingCount}>({worker.workerDetails?.ratingsCount || 0} reviews)</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>${item.price}</Text>
          <Text style={styles.durationText}>/{item.duration}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'Customer'}</Text>
          <Text style={styles.headerSubtitle}>Find a reliable fix today</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.switchButton} onPress={handleRoleSwitch}>
            <Text style={styles.switchButtonText}>Become Worker</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main view */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for pipes leak, fan wiring, deep clean..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              refetch();
            }}
          />
        </View>

        {/* Categories Grid */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard, 
                selectedCategory === cat.name && styles.categoryCardActive
              ]}
              onPress={() => handleCategoryPress(cat.name)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[
                styles.categoryName, 
                selectedCategory === cat.name && styles.categoryNameActive
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Workers List Section */}
        <View style={styles.listSectionHeader}>
          <Text style={styles.sectionTitle}>Available Services</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={styles.refreshLink}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <SkeletalLoader type="card" count={3} />
        ) : services && services.length > 0 ? (
          <FlatList
            data={services}
            renderItem={renderWorkerCard}
            keyExtractor={(item) => item._id}
            scrollEnabled={false} // integrated inside ScrollView
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No services found matching your filters.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.secondary,
    borderBottomLeftRadius: ROUNDING.lg,
    borderBottomRightRadius: ROUNDING.lg,
  },
  greeting: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.primaryLight,
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: ROUNDING.sm,
    marginRight: 6,
  },
  switchButtonText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: ROUNDING.sm,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  searchContainer: {
    marginBottom: SPACING.md,
  },
  searchInput: {
    height: 48,
    backgroundColor: '#fff',
    borderRadius: ROUNDING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 14,
    fontFamily: FONTS.regular,
    ...COLORS.cardShadow,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  categoryScroll: {
    paddingBottom: SPACING.md,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: ROUNDING.md,
    padding: SPACING.md,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...COLORS.cardShadow,
  },
  categoryCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
  },
  categoryNameActive: {
    color: COLORS.primaryDark,
    fontFamily: FONTS.bold,
  },
  listSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  refreshLink: {
    color: COLORS.primaryDark,
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  workerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: ROUNDING.md,
    padding: SPACING.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...COLORS.cardShadow,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    fontSize: 9,
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: ROUNDING.sm,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  workerName: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingStar: {
    color: COLORS.warning,
    fontSize: 12,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  ratingCount: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priceText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.primaryDark,
  },
  durationText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});

export default CustomerHome;
