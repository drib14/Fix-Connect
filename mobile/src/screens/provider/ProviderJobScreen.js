import React, { useContext, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { BookingContext } from "../../context/BookingContext";
import {
  Navigation,
  MapPin,
  Phone,
  CheckCircle2,
  Play,
  User,
  DollarSign,
} from "lucide-react-native";

export default function ProviderJobScreen() {
  const { activeBooking, updateJobStatus } = useContext(BookingContext);
  const [loading, setLoading] = useState(false);

  if (!activeBooking) return null;

  const handleNextStatus = async (targetStatus) => {
    setLoading(true);
    try {
      await updateJobStatus(activeBooking._id, targetStatus);
    } catch (err) {
      Alert.alert("Status Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMaps = () => {
    if (activeBooking.location?.address) {
      const query = encodeURIComponent(activeBooking.location.address);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Active Job Header Banner */}
      <View style={styles.bannerCard}>
        <Text style={styles.bannerStatusLabel}>ACTIVE JOB WORKFLOW</Text>
        <Text style={styles.serviceTitle}>{activeBooking.serviceName}</Text>
        <Text style={styles.bookingCode}>{activeBooking.bookingCode}</Text>
      </View>

      {/* Navigation & Address Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <MapPin color="#EF4444" size={20} />
          <Text style={styles.cardTitle}>Client Service Location</Text>
        </View>
        <Text style={styles.addressText}>{activeBooking.location?.address}</Text>

        {activeBooking.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Client Problem Notes:</Text>
            <Text style={styles.notesText}>{activeBooking.notes}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.mapsBtn} onPress={handleOpenMaps}>
          <Navigation color="#38BDF8" size={18} />
          <Text style={styles.mapsBtnText}>Open GPS Navigation</Text>
        </TouchableOpacity>
      </View>

      {/* Client Profile Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <User color="#38BDF8" size={20} />
          <Text style={styles.cardTitle}>Client Information</Text>
        </View>
        <Text style={styles.clientName}>{activeBooking.customer?.name || "Client"}</Text>
        <Text style={styles.clientPhone}>{activeBooking.customer?.phone || "No Phone"}</Text>

        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => Linking.openURL(`tel:${activeBooking.customer?.phone}`)}
        >
          <Phone color="#FFFFFF" size={18} />
          <Text style={styles.callBtnText}>Call Client</Text>
        </TouchableOpacity>
      </View>

      {/* Payment & Payout Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <DollarSign color="#22C55E" size={20} />
          <Text style={styles.cardTitle}>Payment & Earnings</Text>
        </View>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Total Fare to Collect:</Text>
          <Text style={styles.fareAmount}>₱{activeBooking.totalAmount}</Text>
        </View>
        <Text style={styles.paymentMethodText}>
          Payment Method: {activeBooking.paymentMethod || "CASH"}
        </Text>
      </View>

      {/* Step Action Buttons */}
      <View style={styles.actionSection}>
        {activeBooking.status === "ACCEPTED" && (
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => handleNextStatus("EN_ROUTE")}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Navigation color="#FFFFFF" size={20} />
                <Text style={styles.actionBtnText}>Start Driving (En Route)</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {activeBooking.status === "EN_ROUTE" && (
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => handleNextStatus("ARRIVED")}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MapPin color="#FFFFFF" size={20} />
                <Text style={styles.actionBtnText}>I Have Arrived at Location</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {activeBooking.status === "ARRIVED" && (
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => handleNextStatus("IN_PROGRESS")}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Play color="#FFFFFF" size={20} />
                <Text style={styles.actionBtnText}>Start Repair Work</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {activeBooking.status === "IN_PROGRESS" && (
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: "#22C55E" }]}
            onPress={() => handleNextStatus("COMPLETED")}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <CheckCircle2 color="#FFFFFF" size={20} />
                <Text style={styles.actionBtnText}>Complete & Collect ₱{activeBooking.totalAmount}</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  bannerCard: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0284C7",
  },
  bannerStatusLabel: {
    color: "#38BDF8",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  serviceTitle: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
  },
  bookingCode: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "600",
  },
  addressText: {
    color: "#F1F5F9",
    fontSize: 15,
    marginBottom: 12,
  },
  notesBox: {
    backgroundColor: "#0F172A",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  notesLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
  notesText: {
    color: "#F8FAFC",
    fontSize: 13,
    marginTop: 2,
  },
  mapsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  mapsBtnText: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "600",
  },
  clientName: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "bold",
  },
  clientPhone: {
    color: "#94A3B8",
    fontSize: 14,
    marginBottom: 12,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0284C7",
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  callBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  fareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  fareLabel: {
    color: "#94A3B8",
    fontSize: 14,
  },
  fareAmount: {
    color: "#22C55E",
    fontSize: 20,
    fontWeight: "bold",
  },
  paymentMethodText: {
    color: "#64748B",
    fontSize: 12,
  },
  actionSection: {
    marginTop: 10,
  },
  primaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0284C7",
    borderRadius: 16,
    height: 56,
    gap: 8,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
});
