import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  TextInput,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Shield,
  Repeat,
  LogOut,
  ChevronRight,
  Star,
  Fingerprint,
  Lock,
} from "lucide-react-native";
import { getSecureItem, setSecureItem, deleteSecureItem } from "../../services/storage";

export default function ProfileScreen() {
  const { user, activeRole, switchRole, logout } = useContext(AuthContext);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [promptPasswordModal, setPromptPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const loadBiometricSetting = async () => {
      const isEnabled = await getSecureItem("biometric_login_enabled");
      if (isEnabled === "true") {
        setBiometricEnabled(true);
      }
    };
    loadBiometricSetting();
  }, []);

  const handleSwitchMode = async () => {
    const targetMode = activeRole === "customer" ? "Service Provider / Technician" : "Customer";
    Alert.alert(
      "Switch Mode",
      `Are you sure you want to switch to ${targetMode} mode?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch Mode",
          onPress: async () => {
            await switchRole();
          },
        },
      ]
    );
  };

  const handleToggleBiometrics = async (value) => {
    if (value) {
      // Prompt user to enter password to securely store it
      setPromptPasswordModal(true);
    } else {
      // Disable biometrics
      await deleteSecureItem("biometric_login_enabled");
      await deleteSecureItem("biometric_email");
      await deleteSecureItem("biometric_password");
      setBiometricEnabled(false);
      Alert.alert("Biometrics Disabled", "Biometric login credentials cleared successfully.");
    }
  };

  const handleSaveBiometrics = async () => {
    if (!confirmPassword) {
      Alert.alert("Password Required", "Please enter your password to authorize biometrics.");
      return;
    }

    try {
      // Securely store credentials in SecureStore (encrypted storage)
      await setSecureItem("biometric_login_enabled", "true");
      await setSecureItem("biometric_email", user.email);
      await setSecureItem("biometric_password", confirmPassword);

      setBiometricEnabled(true);
      setPromptPasswordModal(false);
      setConfirmPassword("");
      Alert.alert("Biometrics Enabled", "You can now log in securely using FaceID/TouchID.");
    } catch (err) {
      Alert.alert("Error", "Failed to configure biometric storage.");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.headerTitle}>My Profile</Text>

      {/* Avatar Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name ? user.name[0] : "U"}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        <View style={styles.roleBadge}>
          <Shield color="#22C55E" size={14} />
          <Text style={styles.roleBadgeText}>
            Active Mode: {activeRole.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Mode Switcher Action */}
      <TouchableOpacity style={styles.switchModeCard} onPress={handleSwitchMode}>
        <View style={styles.switchLeft}>
          <View style={styles.switchIconBox}>
            <Repeat color="#22C55E" size={20} />
          </View>
          <View>
            <Text style={styles.switchTitle}>
              Switch to {activeRole === "customer" ? "Provider" : "Customer"} Mode
            </Text>
            <Text style={styles.switchSubtitle}>
              {activeRole === "customer"
                ? "Start receiving repair dispatches"
                : "Book on-demand services as client"}
            </Text>
          </View>
        </View>
        <ChevronRight color="#64748B" size={20} />
      </TouchableOpacity>

      {/* Security settings Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>System Security Settings</Text>

        <View style={styles.settingToggleRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Fingerprint color="#22C55E" size={20} />
            <View>
              <Text style={styles.settingLabel}>Biometric Sign In</Text>
              <Text style={styles.settingSubLabel}>FaceID or TouchID unlock</Text>
            </View>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={handleToggleBiometrics}
            trackColor={{ false: "#1E3A2F", true: "#16A34A" }}
            thumbColor={biometricEnabled ? "#22C55E" : "#94A3B8"}
          />
        </View>

        {promptPasswordModal && (
          <View style={styles.passwordPromptBox}>
            <Text style={styles.promptLabel}>Confirm Password to Enable Biometrics:</Text>
            <View style={styles.passwordInputRow}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry
                placeholder="Enter password"
                placeholderTextColor="#64748B"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity style={styles.saveBiometricsBtn} onPress={handleSaveBiometrics}>
                <Text style={styles.saveBiometricsBtnText}>Authorize</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Account Info Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account Details</Text>

        <View style={styles.infoRow}>
          <User color="#94A3B8" size={18} />
          <Text style={styles.infoLabel}>Full Name</Text>
          <Text style={styles.infoValue}>{user?.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Mail color="#94A3B8" size={18} />
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Phone color="#94A3B8" size={18} />
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{user?.phone}</Text>
        </View>

        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <Star color="#F59E0B" size={18} />
          <Text style={styles.infoLabel}>Rating</Text>
          <Text style={styles.infoValue}>{user?.rating || 5.0} ★</Text>
        </View>
      </View>

      {/* Logout Action */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut color="#EF4444" size={20} />
        <Text style={styles.logoutBtnText}>Sign Out Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1510",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  headerTitle: {
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: "#11221A",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1E3A2F",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  userName: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "bold",
  },
  userEmail: {
    color: "#94A3B8",
    fontSize: 14,
    marginTop: 2,
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  roleBadgeText: {
    color: "#22C55E",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: "#11221A",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1E3A2F",
  },
  sectionTitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E3A2F",
    gap: 12,
  },
  infoLabel: {
    color: "#94A3B8",
    fontSize: 14,
  },
  infoValue: {
    color: "#F1F5F9",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: "auto",
  },
  switchModeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#11221A",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#16A34A",
  },
  switchLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  switchIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  switchTitle: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "700",
  },
  switchSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  settingToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingLabel: {
    color: "#F1F5F9",
    fontSize: 15,
    fontWeight: "600",
  },
  settingSubLabel: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  passwordPromptBox: {
    backgroundColor: "#0B1510",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#1E3A2F",
  },
  promptLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 6,
  },
  passwordInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  passwordInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#11221A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    color: "#F8FAFC",
    paddingHorizontal: 10,
    fontSize: 14,
  },
  saveBiometricsBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBiometricsBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderRadius: 16,
    height: 52,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  logoutBtnText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
});
