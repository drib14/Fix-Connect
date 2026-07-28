import React, { useState } from "react";
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
  Alert,
} from "react-native";
import api from "../../services/api";
import { Mail, ArrowLeft, ShieldAlert, KeyRound } from "lucide-react-native";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg("Please enter your email address");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      if (res.data.success) {
        Alert.alert(
          "Verification Code Sent",
          "If the account exists, a 6-digit secure recovery code has been sent to your email.",
          [
            {
              text: "Enter Code",
              onPress: () => navigation.navigate("ResetPassword", { email }),
            },
          ]
        );
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to process forgot password. Please try again.");
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#22C55E" size={24} />
          <Text style={styles.backText}>Back to Sign In</Text>
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <View style={styles.iconCircle}>
            <KeyRound color="#22C55E" size={40} />
          </View>
          <Text style={styles.title}>Recovery Account</Text>
          <Text style={styles.subtitle}>Secure Password Recovery System</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.instructions}>
            Enter your registered email address below. We will send you a secure 6-digit one-time validation code to reset your password.
          </Text>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <View style={styles.inputWrapper}>
            <Mail color="#A7F3D0" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.actionButtonText}>Send Recovery Code</Text>
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    position: "absolute",
    top: 50,
    left: 24,
  },
  backText: {
    color: "#22C55E",
    fontSize: 15,
    fontWeight: "600",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 28,
    marginTop: 40,
  },
  iconCircle: {
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
  },
  formCard: {
    backgroundColor: "#11221A",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1E3A2F",
  },
  instructions: {
    color: "#94A3B8",
    fontSize: 13,
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
    alignItems: "center",
    backgroundColor: "#0B1510",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    marginBottom: 20,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#F8FAFC",
    fontSize: 15,
  },
  actionButton: {
    backgroundColor: "#16A34A",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
