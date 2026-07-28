import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { BookingContext } from "../../context/BookingContext";
import { BellRing, MapPin, DollarSign, User, Check, X } from "lucide-react-native";

export default function IncomingDispatchModal() {
  const { incomingDispatch, acceptJob, declineJob } = useContext(BookingContext);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    let timer;
    if (incomingDispatch) {
      setSecondsLeft(30);
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            declineJob(); // Auto decline when timer expires
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [incomingDispatch]);

  if (!incomingDispatch) return null;

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await acceptJob(incomingDispatch._id);
    } catch (err) {
      Alert.alert("Accept Error", err.message);
      declineJob();
    } finally {
      setAccepting(false);
    }
  };

  return (
    <Modal visible={!!incomingDispatch} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.dispatchCard}>
          {/* Header Badge */}
          <View style={styles.headerBadge}>
            <BellRing color="#22C55E" size={24} />
            <Text style={styles.headerTitle}>INCOMING JOB DISPATCH</Text>
          </View>

          {/* Countdown Ring */}
          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{secondsLeft}s</Text>
          </View>

          {/* Service Name & Payout */}
          <Text style={styles.serviceTitle}>{incomingDispatch.serviceName}</Text>
          <View style={styles.fareBadge}>
            <DollarSign color="#22C55E" size={20} />
            <Text style={styles.fareText}>₱{incomingDispatch.totalAmount} Payout</Text>
          </View>

          {/* Customer Info */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <User color="#94A3B8" size={18} />
              <Text style={styles.infoText}>
                {incomingDispatch.customer?.name || "Client"} (4.9 ★)
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MapPin color="#F97316" size={18} />
              <Text style={styles.infoText} numberOfLines={2}>
                {incomingDispatch.location?.address}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.declineBtn} onPress={declineJob}>
              <X color="#EF4444" size={20} />
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={handleAccept}
              disabled={accepting}
            >
              {accepting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Check color="#FFFFFF" size={20} />
                  <Text style={styles.acceptBtnText}>ACCEPT JOB</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(11, 21, 16, 0.96)",
    justifyContent: "center",
    padding: 20,
  },
  dispatchCard: {
    backgroundColor: "#11221A",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#16A34A",
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  headerTitle: {
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  timerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#0B1510",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#22C55E",
    marginBottom: 16,
  },
  timerText: {
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "bold",
  },
  serviceTitle: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  fareBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20,
  },
  fareText: {
    color: "#22C55E",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#0B1510",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    color: "#F1F5F9",
    fontSize: 14,
    flex: 1,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  declineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderRadius: 14,
    height: 52,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  declineBtnText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
  acceptBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22C55E",
    borderRadius: 14,
    height: 52,
    gap: 6,
  },
  acceptBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
