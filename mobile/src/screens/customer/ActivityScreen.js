import React, { useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { BookingContext } from "../../context/BookingContext";
import { Clock, MapPin, ChevronRight, CheckCircle2, XCircle } from "lucide-react-native";

export default function ActivityScreen() {
  const { bookingHistory, fetchBookings } = useContext(BookingContext);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const renderBookingItem = ({ item }) => {
    const isCompleted = item.status === "COMPLETED";
    const isCancelled = item.status === "CANCELLED";

    return (
      <View style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.serviceTitle}>{item.serviceName}</Text>
            <Text style={styles.bookingCode}>{item.bookingCode}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              isCompleted && styles.statusCompleted,
              isCancelled && styles.statusCancelled,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isCompleted && styles.statusTextCompleted,
                isCancelled && styles.statusTextCancelled,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <MapPin color="#64748B" size={16} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location?.address}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.timeRow}>
            <Clock color="#64748B" size={14} />
            <Text style={styles.timeText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.priceText}>₱{item.totalAmount}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Booking Activity</Text>
      <FlatList
        data={bookingHistory}
        keyExtractor={(item) => item._id}
        renderItem={renderBookingItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22C55E" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Clock color="#64748B" size={48} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No Booking Activity Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your past and ongoing service requests will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1510",
    paddingTop: 50,
  },
  headerTitle: {
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  bookingCard: {
    backgroundColor: "#11221A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1E3A2F",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  serviceTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
  },
  bookingCode: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusCompleted: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
  },
  statusCancelled: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  statusText: {
    color: "#22C55E",
    fontSize: 11,
    fontWeight: "700",
  },
  statusTextCompleted: {
    color: "#22C55E",
  },
  statusTextCancelled: {
    color: "#EF4444",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  locationText: {
    color: "#94A3B8",
    fontSize: 13,
    flex: 1,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1E3A2F",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    color: "#64748B",
    fontSize: 12,
  },
  priceText: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
});
