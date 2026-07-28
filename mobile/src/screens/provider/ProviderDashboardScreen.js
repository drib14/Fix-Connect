import React, { useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { BookingContext } from "../../context/BookingContext";
import IncomingDispatchModal from "./IncomingDispatchModal";
import ProviderJobScreen from "./ProviderJobScreen";
import {
  Wrench,
  Power,
  DollarSign,
  Briefcase,
  Star,
  ShieldCheck,
  TrendingUp,
} from "lucide-react-native";

export default function ProviderDashboardScreen() {
  const { user, isOnline, toggleOnlineStatus } = useContext(AuthContext);
  const { activeBooking, incomingDispatch } = useContext(BookingContext);

  // If provider has an active job in progress, display ProviderJobScreen
  if (activeBooking) {
    return <ProviderJobScreen />;
  }

  const handleToggleOnline = async () => {
    await toggleOnlineStatus([120.9842, 14.5995]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Provider Header & Online Status Toggle */}
        <View style={styles.headerCard}>
          <View style={styles.headerInfo}>
            <Text style={styles.welcomeText}>Service Provider Mode</Text>
            <Text style={styles.providerName}>{user?.name || "Technician"}</Text>
          </View>

          <View style={styles.toggleBox}>
            <Text
              style={[
                styles.statusText,
                isOnline ? styles.onlineText : styles.offlineText,
              ]}
            >
              {isOnline ? "ONLINE" : "OFFLINE"}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: "#334155", true: "#0284C7" }}
              thumbColor={isOnline ? "#38BDF8" : "#94A3B8"}
            />
          </View>
        </View>

        {/* Live Radar Alert Banner */}
        {isOnline ? (
          <View style={styles.radarBanner}>
            <Power color="#22C55E" size={20} />
            <View style={{ flex: 1 }}>
              <Text style={styles.radarTitle}>Ready for Incoming Dispatches</Text>
              <Text style={styles.radarSubtitle}>
                You will receive instant alerts when clients request nearby repairs.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.offlineBanner}>
            <Power color="#EF4444" size={20} />
            <View style={{ flex: 1 }}>
              <Text style={styles.offlineTitle}>You are currently Offline</Text>
              <Text style={styles.offlineSubtitle}>
                Toggle Online above to start receiving instant job requests.
              </Text>
            </View>
          </View>
        )}

        {/* Today's Metrics Grid */}
        <Text style={styles.sectionTitle}>Today's Dashboard</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.iconBadge, { backgroundColor: "rgba(34, 197, 94, 0.15)" }]}>
              <DollarSign color="#22C55E" size={24} />
            </View>
            <Text style={styles.metricValue}>₱1,850</Text>
            <Text style={styles.metricLabel}>Today's Earnings</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.iconBadge, { backgroundColor: "rgba(56, 189, 248, 0.15)" }]}>
              <Briefcase color="#38BDF8" size={24} />
            </View>
            <Text style={styles.metricValue}>4 Jobs</Text>
            <Text style={styles.metricLabel}>Completed</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.iconBadge, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
              <Star color="#F59E0B" size={24} />
            </View>
            <Text style={styles.metricValue}>4.9 ★</Text>
            <Text style={styles.metricLabel}>Client Rating</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.iconBadge, { backgroundColor: "rgba(168, 85, 247, 0.15)" }]}>
              <TrendingUp color="#A855F7" size={24} />
            </View>
            <Text style={styles.metricValue}>95%</Text>
            <Text style={styles.metricLabel}>Acceptance Rate</Text>
          </View>
        </View>
      </ScrollView>

      {/* Ride-Hailing Incoming Job Alert Overlay */}
      {incomingDispatch ? <IncomingDispatchModal /> : null}
    </View>
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
  },
  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  welcomeText: {
    color: "#94A3B8",
    fontSize: 13,
  },
  providerName: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 2,
  },
  toggleBox: {
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  onlineText: {
    color: "#22C55E",
  },
  offlineText: {
    color: "#94A3B8",
  },
  radarBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  radarTitle: {
    color: "#22C55E",
    fontSize: 15,
    fontWeight: "700",
  },
  radarSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  offlineTitle: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "700",
  },
  offlineSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  metricValue: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "bold",
  },
  metricLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
});
