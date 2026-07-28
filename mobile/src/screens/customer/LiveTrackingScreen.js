import React, { useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { BookingContext } from "../../context/BookingContext";
import {
  UserCheck,
  Navigation,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldAlert,
  Star,
  MapPin,
  Clock,
} from "lucide-react-native";

const STEPS = [
  { key: "ACCEPTED", label: "Accepted", icon: UserCheck },
  { key: "EN_ROUTE", label: "En Route", icon: Navigation },
  { key: "ARRIVED", label: "Arrived", icon: MapPin },
  { key: "IN_PROGRESS", label: "Working", icon: Clock },
  { key: "COMPLETED", label: "Done", icon: CheckCircle2 },
];

export default function LiveTrackingScreen() {
  const { activeBooking, updateJobStatus } = useContext(BookingContext);

  if (!activeBooking) return null;

  const currentStepIndex = STEPS.findIndex((s) => s.key === activeBooking.status);

  const handleCall = () => {
    if (activeBooking.provider?.phone) {
      Linking.openURL(`tel:${activeBooking.provider.phone}`);
    } else {
      Alert.alert("Contact Pro", "Provider phone number unavailable.");
    }
  };

  const handleCancel = async () => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel this booking?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            await updateJobStatus(activeBooking._id, "CANCELLED");
          } catch (err) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Live Map / Header Simulation */}
      <View style={styles.mapSimCard}>
        <View style={styles.livePulseBadge}>
          <View style={styles.greenDot} />
          <Text style={styles.liveBadgeText}>LIVE TRACKING</Text>
        </View>
        <Text style={styles.mapHeadline}>
          {activeBooking.status === "ACCEPTED" && "Provider accepted your request!"}
          {activeBooking.status === "EN_ROUTE" && "Provider is driving to your location"}
          {activeBooking.status === "ARRIVED" && "Technician has arrived at location!"}
          {activeBooking.status === "IN_PROGRESS" && "Service repair in progress..."}
          {activeBooking.status === "COMPLETED" && "Service completed & paid!"}
        </Text>
        <Text style={styles.mapSubText}>ETA: ~10 mins • 2.8 km away</Text>
      </View>

      {/* Progress Stepper */}
      <View style={styles.stepperContainer}>
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx <= currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <View key={step.key} style={styles.stepItem}>
              <View
                style={[
                  styles.stepIconCircle,
                  isActive && styles.stepIconActive,
                  isCurrent && styles.stepIconCurrent,
                ]}
              >
                <Icon color={isActive ? "#FFFFFF" : "#64748B"} size={18} />
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                ]}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Assigned Technician Profile Card */}
      {activeBooking.provider ? (
        <View style={styles.providerCard}>
          <View style={styles.providerHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {activeBooking.provider.name ? activeBooking.provider.name[0] : "P"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.providerName}>{activeBooking.provider.name}</Text>
              <View style={styles.ratingRow}>
                <Star color="#F59E0B" fill="#F59E0B" size={16} />
                <Text style={styles.ratingText}>
                  {activeBooking.provider.rating || 5.0} • Verified Pro
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
              <Phone color="#38BDF8" size={18} />
              <Text style={styles.contactBtnText}>Call Technician</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.chatBtn}>
              <MessageSquare color="#F8FAFC" size={18} />
              <Text style={styles.chatBtnText}>In-App Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Booking Details Breakdown */}
      <View style={styles.detailsCard}>
        <Text style={styles.cardHeaderTitle}>Service Details</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Booking Code:</Text>
          <Text style={styles.detailValue}>{activeBooking.bookingCode}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Service Name:</Text>
          <Text style={styles.detailValue}>{activeBooking.serviceName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Address:</Text>
          <Text style={styles.detailValue} numberOfLines={2}>
            {activeBooking.location?.address}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Fare:</Text>
          <Text style={styles.totalFareText}>₱{activeBooking.totalAmount}</Text>
        </View>
      </View>

      {/* Cancel Option if not completed */}
      {activeBooking.status !== "COMPLETED" ? (
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <ShieldAlert color="#EF4444" size={18} />
          <Text style={styles.cancelBtnText}>Cancel Booking</Text>
        </TouchableOpacity>
      ) : null}
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
    paddingBottom: 40,
  },
  mapSimCard: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#0284C7",
  },
  livePulseBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 10,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  liveBadgeText: {
    color: "#22C55E",
    fontSize: 11,
    fontWeight: "700",
  },
  mapHeadline: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  mapSubText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  stepperContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
  },
  stepIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  stepIconActive: {
    backgroundColor: "#0284C7",
  },
  stepIconCurrent: {
    backgroundColor: "#38BDF8",
  },
  stepLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
  },
  stepLabelActive: {
    color: "#F8FAFC",
  },
  providerCard: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  providerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#38BDF8",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "bold",
  },
  providerName: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "bold",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  ratingText: {
    color: "#F59E0B",
    fontSize: 13,
    fontWeight: "600",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  contactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  contactBtnText: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "600",
  },
  chatBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0284C7",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  chatBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  detailsCard: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardHeaderTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailLabel: {
    color: "#94A3B8",
    fontSize: 14,
  },
  detailValue: {
    color: "#F1F5F9",
    fontSize: 14,
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  totalFareText: {
    color: "#38BDF8",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  cancelBtnText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "600",
  },
});
