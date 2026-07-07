import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormInput } from '@/components/FormInput';
import { useBookingStore } from '@/store/useBookingStore';
import { useServices, useCreateDraft } from '@/hooks/useBookingQuery';
import { useLocation } from '@/hooks/useLocation';
import { COLORS, SHADOWS } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';

export default function BookingSetupScreen() {
  const router = useRouter();
  const draft = useBookingStore((s) => s.draft);
  const setDraft = useBookingStore((s) => s.setDraft);
  const { data: services, isLoading: servicesLoading } = useServices(draft?.category);
  const createDraftMutation = useCreateDraft();
  const { location, requestLocation, reverseGeocode } = useLocation();

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (draft) {
      setDescription(draft.problem_description);
      setAddress(draft.formatted_address);
      if (draft.latitude) {
        setLat(draft.latitude);
        setLon(draft.longitude);
      }
    }
  }, [draft]);

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    const coords = await requestLocation();
    if (coords) {
      setLat(coords.latitude);
      setLon(coords.longitude);
      const addrStr = await reverseGeocode(coords.latitude, coords.longitude);
      if (addrStr) {
        setAddress(addrStr);
      } else {
        setAddress(`Coordinates: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }
    }
    setIsGettingLocation(false);
  };

  const handleConfirmDraft = async () => {
    if (!selectedServiceId) {
      Alert.alert('Selection Required', 'Please pick a specific service task.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Address Required', 'Please enter or select a service address.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Description Required', 'Please briefly explain the issue or details of the request.');
      return;
    }

    const latitude = lat || 14.5995;
    const longitude = lon || 120.9842;

    try {
      const response = await createDraftMutation.mutateAsync({
        service_id: selectedServiceId,
        latitude,
        longitude,
        formatted_address: address.trim(),
        problem_description: description.trim(),
      });

      // Save complete booking draft details to store
      const serviceObj = services?.find((s: any) => s._id === selectedServiceId);
      setDraft({
        service_id: selectedServiceId,
        service_title: serviceObj?.title || 'Service',
        category: draft?.category || '',
        latitude,
        longitude,
        formatted_address: address.trim(),
        problem_description: description.trim(),
        attachment_urls: [],
        scheduled_at: null,
      });

      // Save active booking credentials to context
      useBookingStore.getState().setActiveBooking(response.booking._id, 'DRAFT');
      useBookingStore.getState().setTotalAmount(response.booking.total_amount);

      router.push('/booking/matching');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to initialize booking.');
    }
  };

  const selectedService = services?.find((s: any) => s._id === selectedServiceId);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header Navigation */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Configure Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Select service task */}
        <Text style={styles.sectionTitle}>1. Select Service Package</Text>
        {servicesLoading ? (
          <ActivityIndicator color={COLORS.primary[500]} style={{ marginVertical: 12 }} />
        ) : (
          <View style={styles.servicesList}>
            {services?.map((service: any) => (
              <Pressable
                key={service._id}
                onPress={() => setSelectedServiceId(service._id)}
                style={[
                  styles.serviceItem,
                  selectedServiceId === service._id && styles.serviceItemActive,
                ]}
              >
                <View style={styles.serviceRow}>
                  <Ionicons
                    name={service.icon_name || 'construct-outline'}
                    size={20}
                    color={selectedServiceId === service._id ? COLORS.primary[600] : COLORS.text.secondary}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.serviceTitleText, selectedServiceId === service._id && styles.activeText]}>
                      {service.title}
                    </Text>
                    <Text style={styles.serviceDescText} numberOfLines={2}>
                      {service.description}
                    </Text>
                  </View>
                  <Text style={styles.serviceRate}>
                    {formatCurrency(service.base_rate)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Step 2: Location Selector */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>2. Service Address</Text>
        <View style={styles.locationContainer}>
          <FormInput
            label="Service Address / Location Details"
            icon="location-outline"
            placeholder="Search address or tap GPS icon"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={2}
            containerStyle={{ flex: 1, marginBottom: 0 }}
          />
          <Pressable
            onPress={handleGetCurrentLocation}
            disabled={isGettingLocation}
            style={[styles.gpsBtn, SHADOWS.small]}
          >
            {isGettingLocation ? (
              <ActivityIndicator color={COLORS.primary[600]} />
            ) : (
              <Ionicons name="locate" size={24} color={COLORS.primary[600]} />
            )}
          </Pressable>
        </View>

        {/* Step 3: Describe Problem */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>3. Request Details</Text>
        <FormInput
          label="Problem Description"
          icon="document-text-outline"
          placeholder="Describe your issue, requirements, or instructions..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top', paddingTop: 10 }}
        />

        {/* Fare Estimate Quote summary if service is selected */}
        {selectedService && (
          <View style={[styles.quoteCard, SHADOWS.small]}>
            <Text style={styles.quoteTitle}>Quote Summary</Text>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Base Price</Text>
              <Text style={styles.quoteVal}>{formatCurrency(selectedService.base_rate)}</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Platform Fee (15%)</Text>
              <Text style={styles.quoteVal}>{formatCurrency(Math.round(selectedService.base_rate * 0.15))}</Text>
            </View>
            <View style={[styles.quoteRow, styles.quoteTotalRow]}>
              <Text style={styles.quoteTotalLabel}>Est. Total</Text>
              <Text style={styles.quoteTotalVal}>
                {formatCurrency(Math.round(selectedService.base_rate * 1.15))}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Request Action Button */}
      <View style={[styles.footer, SHADOWS.large]}>
        <Pressable
          onPress={handleConfirmDraft}
          disabled={createDraftMutation.isPending}
          style={({ pressed }) => [
            styles.bookBtn,
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            createDraftMutation.isPending && { opacity: 0.7 },
          ]}
        >
          {createDraftMutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.bookBtnText}>Confirm Booking Request</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  servicesList: {
    gap: 10,
  },
  serviceItem: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  serviceItemActive: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  activeText: {
    color: COLORS.primary[700],
  },
  serviceDescText: {
    fontSize: 11,
    color: COLORS.text.secondary,
    marginTop: 2,
    lineHeight: 15,
  },
  serviceRate: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary[700],
    marginLeft: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  gpsBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  quoteCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  quoteTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  quoteLabel: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  quoteVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  quoteTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8,
    paddingTop: 10,
  },
  quoteTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  quoteTotalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary[700],
  },
  footer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bookBtn: {
    backgroundColor: COLORS.primary[600],
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
