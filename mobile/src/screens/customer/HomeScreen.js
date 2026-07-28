import React, { useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { BookingContext } from "../../context/BookingContext";
import { AuthContext } from "../../context/AuthContext";
import SearchingModal from "./SearchingModal";
import LiveTrackingScreen from "./LiveTrackingScreen";
import {
  MapPin,
  Wrench,
  Zap,
  Wind,
  Sparkles,
  Key,
  Tv,
  ArrowRight,
  ShieldCheck,
} from "lucide-react-native";

import LocationPicker from "../../components/LocationPicker";

const ICON_MAP = {
  Wrench: Wrench,
  Zap: Zap,
  Wind: Wind,
  Sparkles: Sparkles,
  Key: Key,
  Tv: Tv,
};

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const {
    services,
    activeBooking,
    isSearching,
    createInstantBooking,
  } = useContext(BookingContext);

  const [selectedService, setSelectedService] = useState(null);
  const [address, setAddress] = useState(user?.location?.address || "Manila, Metro Manila");
  const [coordinates, setCoordinates] = useState(user?.location?.coordinates || [120.9842, 14.5995]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLocationSelect = (loc) => {
    setAddress(loc.address);
    if (loc.coordinates) {
      setCoordinates(loc.coordinates);
    }
  };

  // If user has an active non-searching booking, render Live Tracking View
  if (activeBooking && activeBooking.status !== "SEARCHING") {
    return <LiveTrackingScreen />;
  }

  const handleRequestService = async () => {
    if (!selectedService) {
      Alert.alert("Select Service", "Please select a service category to request.");
      return;
    }
    if (!address) {
      Alert.alert("Location Required", "Please enter your pickup address.");
      return;
    }

    setLoading(true);
    try {
      await createInstantBooking({
        serviceName: selectedService.name,
        category: selectedService.slug,
        address,
        coordinates: coordinates && coordinates.length === 2 ? coordinates : [120.9842, 14.5995],
        notes,
      });
    } catch (err) {
      Alert.alert("Request Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcomeText}>Hello, {user?.name || "Customer"}</Text>
            <Text style={styles.headerTitle}>Need a Quick Repair?</Text>
          </View>
          <View style={styles.badgeContainer}>
            <ShieldCheck color="#22C55E" size={18} />
            <Text style={styles.badgeText}>Secured Pro</Text>
          </View>
        </View>

        {/* Location Picker Banner */}
        <View style={styles.locationCard}>
          <MapPin color="#F97316" size={22} style={styles.locationIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.locationLabel}>SERVICE LOCATION (SECURED)</Text>
            <TextInput
              style={styles.locationInput}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter service location address"
              placeholderTextColor="#64748B"
            />
          </View>
        </View>

        {/* Service Categories Grid */}
        <Text style={styles.sectionTitle}>Select On-Demand Service</Text>
        <View style={styles.gridContainer}>
          {services.map((service) => {
            const IconComponent = ICON_MAP[service.icon] || Wrench;
            const isSelected = selectedService?._id === service._id;

            return (
              <TouchableOpacity
                key={service._id || service.slug}
                style={[
                  styles.serviceCard,
                  isSelected && styles.serviceCardSelected,
                ]}
                onPress={() => setSelectedService(service)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.iconBox,
                    isSelected && styles.iconBoxSelected,
                  ]}
                >
                  <IconComponent
                    color={isSelected ? "#11221A" : "#22C55E"}
                    size={28}
                  />
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>₱{service.basePrice} base</Text>
                <Text style={styles.serviceEta}>{service.estimatedDuration}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notes & Instant Dispatch Action Card */}
        {selectedService ? (
          <View style={styles.bookingBox}>
            <Text style={styles.bookingBoxTitle}>
              Instant Dispatch: {selectedService.name}
            </Text>
            <Text style={styles.bookingBoxSubtitle}>
              Dispatches nearest available provider in 30 seconds
            </Text>

            <LocationPicker
              initialAddress={address}
              onLocationSelect={handleLocationSelect}
              placeholder="Search pickup address..."
              label="Service Pickup Location:"
            />

            <TextInput
              style={styles.notesInput}
              placeholder="Describe problem (e.g. leaking kitchen pipe)"
              placeholderTextColor="#64748B"
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <TouchableOpacity
              style={styles.requestButton}
              onPress={handleRequestService}
              disabled={loading}
            >
              <Text style={styles.requestButtonText}>
                {loading ? "Searching..." : `Request Now • ₱${selectedService.basePrice}`}
              </Text>
              <ArrowRight color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      {/* Ride-Hailing Animated Searching Pulse Modal */}
      {isSearching ? <SearchingModal /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1510",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  welcomeText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  headerTitle: {
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "bold",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  badgeText: {
    color: "#22C55E",
    fontSize: 12,
    fontWeight: "600",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#11221A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1E3A2F",
  },
  locationIcon: {
    marginRight: 12,
  },
  locationLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  locationInput: {
    color: "#F1F5F9",
    fontSize: 15,
    fontWeight: "500",
    marginTop: 2,
    padding: 0,
  },
  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  serviceCard: {
    width: "48%",
    backgroundColor: "#11221A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E3A2F",
  },
  serviceCardSelected: {
    borderColor: "#22C55E",
    backgroundColor: "rgba(34, 197, 94, 0.08)",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconBoxSelected: {
    backgroundColor: "#22C55E",
  },
  serviceName: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  servicePrice: {
    color: "#22C55E",
    fontSize: 13,
    fontWeight: "700",
  },
  serviceEta: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  bookingBox: {
    backgroundColor: "#11221A",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#16A34A",
  },
  bookingBoxTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
  },
  bookingBoxSubtitle: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 2,
    marginBottom: 14,
  },
  notesInput: {
    backgroundColor: "#0B1510",
    borderRadius: 12,
    padding: 14,
    color: "#F8FAFC",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    marginBottom: 16,
    height: 70,
    textAlignVertical: "top",
  },
  requestButton: {
    backgroundColor: "#16A34A",
    borderRadius: 14,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  requestButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
