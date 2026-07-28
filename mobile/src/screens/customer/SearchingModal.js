import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { BookingContext } from "../../context/BookingContext";
import { Radio, X, MapPin } from "lucide-react-native";

export default function SearchingModal() {
  const { activeBooking, isSearching, updateJobStatus, setIsSearching } = useContext(BookingContext);
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    let timer;
    if (isSearching) {
      timer = setInterval(() => {
        setSeconds((prev) => (prev > 0 ? prev - 1 : 30));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSearching]);

  const handleCancel = async () => {
    if (activeBooking?._id) {
      try {
        await updateJobStatus(activeBooking._id, "CANCELLED");
      } catch (err) {
        console.error("Cancel failed:", err);
      }
    }
    setIsSearching(false);
  };

  return (
    <Modal visible={isSearching} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.contentCard}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleCancel}>
            <X color="#94A3B8" size={24} />
          </TouchableOpacity>

          <View style={styles.pulseContainer}>
            <View style={styles.pulseOuter}>
              <View style={styles.pulseInner}>
                <Radio color="#22C55E" size={40} />
              </View>
            </View>
          </View>

          <Text style={styles.searchingTitle}>Finding Nearby Pro...</Text>
          <Text style={styles.searchingSubtitle}>
            Broadcasting dispatch request to available technicians within 10 km
          </Text>

          <View style={styles.timerBadge}>
            <ActivityIndicator color="#22C55E" size="small" />
            <Text style={styles.timerText}>00:{seconds < 10 ? `0${seconds}` : seconds}</Text>
          </View>

          {activeBooking ? (
            <View style={styles.detailsCard}>
              <Text style={styles.serviceName}>{activeBooking.serviceName}</Text>
              <View style={styles.locationRow}>
                <MapPin color="#F97316" size={16} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {activeBooking.location?.address}
                </Text>
              </View>
              <Text style={styles.fareText}>Est. Total: ₱{activeBooking.totalAmount}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel Request</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(11, 21, 16, 0.94)",
    justifyContent: "center",
    padding: 24,
  },
  contentCard: {
    backgroundColor: "#11221A",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E3A2F",
    elevation: 8,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
  },
  pulseContainer: {
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  pulseInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(34, 197, 94, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchingTitle: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
  },
  searchingSubtitle: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B1510",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 20,
  },
  timerText: {
    color: "#22C55E",
    fontSize: 16,
    fontWeight: "700",
  },
  detailsCard: {
    width: "100%",
    backgroundColor: "#0B1510",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  serviceName: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  locationText: {
    color: "#94A3B8",
    fontSize: 13,
    flex: 1,
  },
  fareText: {
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "700",
  },
  cancelButton: {
    width: "100%",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderRadius: 14,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  cancelButtonText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "600",
  },
});
