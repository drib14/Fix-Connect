import React, { useState, useEffect } from "react";
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
import { ShieldCheck, Lock, Check, X, KeySquare } from "lucide-react-native";

export default function ResetPasswordScreen({ route, navigation }) {
  const { email } = route.params || {};
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [reqs, setReqs] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
  });

  useEffect(() => {
    setReqs({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
    });
  }, [password]);

  const isPasswordValid = reqs.length && reqs.upper && reqs.lower && reqs.number;

  const handleResetPassword = async () => {
    if (!token || !password) {
      setErrorMsg("Please fill out all fields");
      return;
    }
    if (!isPasswordValid) {
      setErrorMsg("New password must satisfy all security rules");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        token: token.trim(),
        password,
      });

      if (res.data.success) {
        Alert.alert(
          "Password Reset Success",
          "Your password has been securely updated. Please log in using your new credentials.",
          [{ text: "Log In", onPress: () => navigation.navigate("Login") }]
        );
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to reset password. Code may be invalid or expired.");
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
          <View style={styles.iconCircle}>
            <ShieldCheck color="#22C55E" size={40} />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Configure New Secured Password</Text>
        </View>

        <View style={styles.formCard}>
          {email ? (
            <Text style={styles.recipientText}>
              Resetting password for: <Text style={styles.boldEmail}>{email}</Text>
            </Text>
          ) : null}

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <Text style={styles.fieldLabel}>Recovery Code</Text>
          <View style={styles.inputWrapper}>
            <KeySquare color="#A7F3D0" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit Code"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              maxLength={6}
              value={token}
              onChangeText={setToken}
            />
          </View>

          <Text style={styles.fieldLabel}>New Secure Password</Text>
          <View style={styles.inputWrapper}>
            <Lock color="#A7F3D0" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Min 8 characters"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Complexity Rules Checklist */}
          <View style={styles.reqsBox}>
            <Text style={styles.reqsTitle}>Password Complexity Rules:</Text>
            <View style={styles.reqRow}>
              {reqs.length ? <Check color="#22C55E" size={14} /> : <X color="#EF4444" size={14} />}
              <Text style={[styles.reqText, reqs.length && styles.reqTextValid]}>At least 8 characters</Text>
            </View>
            <View style={styles.reqRow}>
              {reqs.upper ? <Check color="#22C55E" size={14} /> : <X color="#EF4444" size={14} />}
              <Text style={[styles.reqText, reqs.upper && styles.reqTextValid]}>At least one uppercase letter</Text>
            </View>
            <View style={styles.reqRow}>
              {reqs.lower ? <Check color="#22C55E" size={14} /> : <X color="#EF4444" size={14} />}
              <Text style={[styles.reqText, reqs.lower && styles.reqTextValid]}>At least one lowercase letter</Text>
            </View>
            <View style={styles.reqRow}>
              {reqs.number ? <Check color="#22C55E" size={14} /> : <X color="#EF4444" size={14} />}
              <Text style={[styles.reqText, reqs.number && styles.reqTextValid]}>At least one numeric digit</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, !isPasswordValid && styles.actionButtonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.actionButtonText}>Update Password</Text>
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
    marginBottom: 24,
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
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E3A2F",
  },
  recipientText: {
    color: "#94A3B8",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  boldEmail: {
    color: "#22C55E",
    fontWeight: "600",
  },
  fieldLabel: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
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
    marginBottom: 16,
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
  reqsBox: {
    backgroundColor: "#0B1510",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    marginBottom: 18,
    gap: 6,
  },
  reqsTitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  reqRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reqText: {
    color: "#EF4444",
    fontSize: 12,
  },
  reqTextValid: {
    color: "#22C55E",
  },
  actionButton: {
    backgroundColor: "#16A34A",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonDisabled: {
    backgroundColor: "#1E3A2F",
    opacity: 0.5,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
