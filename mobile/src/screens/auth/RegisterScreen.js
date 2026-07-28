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
import { User, Mail, Phone, Lock, Wrench, ShieldCheck } from "lucide-react-native";

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer"); // 'customer' or 'provider'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      setErrorMsg("Please fill out all required fields");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      await register({
        name,
        email,
        phone,
        password,
        role,
        serviceCategories: role === "provider" ? ["Plumbing", "Electrical", "Cleaning"] : [],
      });
    } catch (err) {
      setErrorMsg(err.message || "Registration failed. Try again.");
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Fix-Connect Instant Services</Text>
        </View>

        <View style={styles.formCard}>
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <Text style={styles.label}>Select Account Role</Text>
          <View style={styles.roleToggleRow}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "customer" && styles.roleButtonActive,
              ]}
              onPress={() => setRole("customer")}
            >
              <User
                color={role === "customer" ? "#38BDF8" : "#94A3B8"}
                size={20}
              />
              <Text
                style={[
                  styles.roleText,
                  role === "customer" && styles.roleTextActive,
                ]}
              >
                Customer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "provider" && styles.roleButtonActive,
              ]}
              onPress={() => setRole("provider")}
            >
              <Wrench
                color={role === "provider" ? "#38BDF8" : "#94A3B8"}
                size={20}
              />
              <Text
                style={[
                  styles.roleText,
                  role === "provider" && styles.roleTextActive,
                ]}
              >
                Provider / Tech
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <User color="#94A3B8" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#64748B"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Mail color="#94A3B8" size={20} style={styles.inputIcon} />
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
            <Phone color="#94A3B8" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mobile Phone Number"
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Lock color="#94A3B8" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password (min 6 characters)"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonInner}>
                <ShieldCheck color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
                <Text style={styles.registerButtonText}>Register Account</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginText}>Sign In</Text>
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
    backgroundColor: "#0F172A",
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
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  roleToggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 8,
  },
  roleButtonActive: {
    borderColor: "#38BDF8",
    backgroundColor: "rgba(56, 189, 248, 0.1)",
  },
  roleText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
  },
  roleTextActive: {
    color: "#38BDF8",
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
    backgroundColor: "#0F172A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#F8FAFC",
    fontSize: 15,
  },
  registerButton: {
    backgroundColor: "#0284C7",
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  footerText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  loginText: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "600",
  },
});
