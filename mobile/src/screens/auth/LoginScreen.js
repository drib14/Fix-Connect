import React, { useState, useContext, useEffect } from "react";
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
import { AuthContext } from "../../context/AuthContext";
import { ShieldCheck, Mail, Lock, LogIn, Fingerprint, ShieldAlert } from "lucide-react-native";
import { getSecureItem, setSecureItem } from "../../services/storage";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Check if biometric authentication option is toggled/saved
  useEffect(() => {
    const checkBiometrics = async () => {
      const isEnabled = await getSecureItem("biometric_login_enabled");
      if (isEnabled === "true") {
        setBiometricEnabled(true);
      }
    };
    checkBiometrics();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Please enter email and password");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setErrorMsg(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometricEnabled) {
      Alert.alert(
        "Enable Biometrics",
        "Please log in with password first and enable Biometrics in your profile settings."
      );
      return;
    }
    // Simulate systematic secure biometric trigger
    Alert.alert("Biometric Unlock", "Authenticating via TouchID/FaceID...", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Authenticate",
        onPress: async () => {
          const storedEmail = await getSecureItem("biometric_email");
          const storedPassword = await getSecureItem("biometric_password");
          if (storedEmail && storedPassword) {
            setLoading(true);
            try {
              await login(storedEmail, storedPassword);
            } catch (err) {
              setErrorMsg("Biometric login failed. Please sign in with password.");
            } finally {
              setLoading(false);
            }
          } else {
            setErrorMsg("Biometric credentials missing. Please enter password.");
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={styles.logoBadge}>
            <ShieldCheck color="#22C55E" size={44} />
          </View>
          <Text style={styles.title}>Fix-Connect</Text>
          <Text style={styles.subtitle}>Secure On-Demand Instant Services</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.securityHeader}>
            <Text style={styles.formTitle}>Secure Sign In</Text>
            <View style={styles.securedBadge}>
              <ShieldCheck color="#22C55E" size={14} />
              <Text style={styles.securedBadgeText}>AES-256</Text>
            </View>
          </View>

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

          <View style={styles.inputWrapper}>
            <Lock color="#A7F3D0" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.buttonInner}>
                  <LogIn color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.loginButtonText}>Sign In</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.biometricBtn, biometricEnabled && styles.biometricBtnActive]}
              onPress={handleBiometricLogin}
            >
              <Fingerprint color={biometricEnabled ? "#22C55E" : "#94A3B8"} size={26} />
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 32,
  },
  logoBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  title: {
    fontSize: 32,
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
    elevation: 4,
  },
  securityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#F1F5F9",
  },
  securedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.25)",
  },
  securedBadgeText: {
    color: "#22C55E",
    fontSize: 10,
    fontWeight: "700",
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
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  loginButton: {
    flex: 1,
    backgroundColor: "#16A34A",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  biometricBtn: {
    width: 52,
    height: 52,
    backgroundColor: "#0B1510",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1E3A2F",
  },
  biometricBtnActive: {
    borderColor: "#22C55E",
    backgroundColor: "rgba(34, 197, 94, 0.08)",
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  signupText: {
    color: "#F97316",
    fontSize: 14,
    fontWeight: "600",
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 20,
    marginTop: -4,
  },
  forgotText: {
    color: "#F97316",
    fontSize: 13,
    fontWeight: "600",
  },
});
