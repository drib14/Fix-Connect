import React, { useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { MapPin, ShieldCheck, ArrowRight, UserCheck } from "lucide-react-native";

export default function CustomerOnboardingScreen() {
  const { onboardCustomer, user } = useContext(AuthContext);
  const [address, setAddress] = useState(user?.location?.address || "");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCompleteOnboarding = async () => {
    if (!address.trim()) {
      setErrorMsg("Please enter your primary service location address");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    try {
      const defaultCoordinates = [120.9842, 14.5995];
      await onboardCustomer({
        address: address.trim(),
        coordinates: defaultCoordinates,
      });
    } catch (err) {
      setErrorMsg(err.message || "Failed to complete customer onboarding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={styles.iconBadge}>
            <UserCheck color="#22C55E" size={40} />
          </View>
          <Text style={styles.title}>Customer Setup</Text>
          <Text style={styles.subtitle}>Welcome to Fix-Connect! Set up your booking profile.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.stepTitle}>Primary Service Location</Text>
          <Text style={styles.instructions}>
            Please provide your default home or office address where service technicians and providers will be dispatched.
          </Text>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <View style={styles.inputWrapper}>
            <MapPin color="#22C55E" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 123 Quezon Ave, Barangay South, Quezon City"
              placeholderTextColor="#64748B"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.infoBox}>
            <ShieldCheck color="#22C55E" size={18} />
            <Text style={styles.infoBoxText}>
              Your address is encrypted and only shared with assigned service providers upon job acceptance.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleCompleteOnboarding}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.btnInner}>
                <Text style={styles.submitBtnText}>Complete Setup</Text>
                <ArrowRight color="#FFFFFF" size={18} style={{ marginLeft: 8 }} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1510",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F8FAFC",
  },
  subtitle: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 4,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#11221A",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1E3A2F",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F1F5F9",
    marginBottom: 6,
  },
  instructions: {
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 20,
    marginBottom: 20,
  },
  errorText: {
    color: "#EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 10,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#0B1510",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    padding: 14,
    marginBottom: 16,
    minHeight: 90,
  },
  inputIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  input: {
    flex: 1,
    color: "#F8FAFC",
    fontSize: 14,
    textAlignVertical: "top",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
    gap: 10,
    marginBottom: 24,
  },
  infoBoxText: {
    color: "#A7F3D0",
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  submitBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  btnInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
