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
  Modal,
  FlatList,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { User, Mail, Lock, Wrench, ShieldCheck, Check, X, Search, ChevronDown } from "lucide-react-native";

// Supported list of international dial codes with unicode flags
const COUNTRIES = [
  { code: "PH", dialCode: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "US", dialCode: "+1", name: "United States", flag: "🇺🇸" },
  { code: "GB", dialCode: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "SG", dialCode: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "AU", dialCode: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "SA", dialCode: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AE", dialCode: "+971", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "MY", dialCode: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "ID", dialCode: "+62", name: "Indonesia", flag: "🇮🇩" },
  { code: "IN", dialCode: "+91", name: "India", flag: "🇮🇳" },
  { code: "JP", dialCode: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "KR", dialCode: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "NZ", dialCode: "+64", name: "New Zealand", flag: "🇳🇿" },
  { code: "CA", dialCode: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "DE", dialCode: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "FR", dialCode: "+33", name: "France", flag: "🇫🇷" },
  { code: "ES", dialCode: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "IT", dialCode: "+39", name: "Italy", flag: "🇮🇹" },
];

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Phone components
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default PH
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Password requirements state
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

  const handlePhoneChange = (text) => {
    // SECURE SANITIZATION: Strictly allow only numeric digits.
    // Removes any space, hyphens, brackets, or letters entered by paste or custom keyboards.
    const cleanText = text.replace(/[^0-9]/g, "");
    setPhone(cleanText);
  };

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      setErrorMsg("Please fill out all required fields");
      return;
    }
    if (!isPasswordValid) {
      setErrorMsg("Please satisfy all password complexity rules");
      return;
    }

    // Standardize E.164 phone structure
    const fullPhone = `${selectedCountry.dialCode}${phone}`;
    
    // Check E.164 length limits: dialCode + number digits should be between 8 and 15 digits total
    const digitsOnly = fullPhone.replace("+", "");
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      setErrorMsg("Phone number length is invalid for the selected country");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    try {
      await register({
        name,
        email,
        phone: fullPhone,
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

  // Filter countries list by search query
  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery)
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Secure Register</Text>
          <Text style={styles.subtitle}>Join Fix-Connect Protected Services</Text>
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
                color={role === "customer" ? "#22C55E" : "#94A3B8"}
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
                color={role === "provider" ? "#22C55E" : "#94A3B8"}
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

          {/* Full Name */}
          <View style={styles.inputWrapper}>
            <User color="#A7F3D0" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#64748B"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email Address */}
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

          {/* Modern Country Code Picker + Phone Input */}
          <View style={styles.phoneInputRow}>
            {/* Country Selector Button */}
            <TouchableOpacity
              style={styles.countryPickerButton}
              onPress={() => setCountryModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.flagText}>{selectedCountry.flag}</Text>
              <Text style={styles.dialCodeText}>{selectedCountry.dialCode}</Text>
              <ChevronDown color="#94A3B8" size={14} />
            </TouchableOpacity>

            {/* Digits-only phone textinput */}
            <View style={styles.phoneInputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                placeholderTextColor="#64748B"
                keyboardType="number-pad"
                value={phone}
                onChangeText={handlePhoneChange}
                maxLength={10} // Philippines standards or generic caps
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Lock color="#A7F3D0" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password (min 8 characters)"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Password Security Complexity Indicators */}
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
            style={[styles.registerButton, !isPasswordValid && styles.registerButtonDisabled]}
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

      {/* Country Selector Modal Dialog */}
      <Modal
        visible={countryModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country Code</Text>
              <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
                <X color="#F8FAFC" size={22} />
              </TouchableOpacity>
            </View>

            {/* Search Box */}
            <View style={styles.searchWrapper}>
              <Search color="#94A3B8" size={18} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search country name or code..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* List */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setSelectedCountry(item);
                    setCountryModalVisible(false);
                    setSearchQuery("");
                  }}
                >
                  <Text style={styles.modalFlag}>{item.flag}</Text>
                  <Text style={styles.countryNameText}>{item.name}</Text>
                  <Text style={styles.countryDialText}>{item.dialCode}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        </View>
      </Modal>
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
    backgroundColor: "#0B1510",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    gap: 8,
  },
  roleButtonActive: {
    borderColor: "#22C55E",
    backgroundColor: "rgba(34, 197, 94, 0.08)",
  },
  roleText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
  },
  roleTextActive: {
    color: "#22C55E",
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
  phoneInputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  countryPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B1510",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    paddingHorizontal: 12,
    height: 50,
    gap: 6,
  },
  flagText: {
    fontSize: 18,
  },
  dialCodeText: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "600",
  },
  phoneInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B1510",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    paddingHorizontal: 14,
    height: 50,
  },
  reqsBox: {
    backgroundColor: "#0B1510",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    marginBottom: 16,
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
  registerButton: {
    backgroundColor: "#16A34A",
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  registerButtonDisabled: {
    backgroundColor: "#1E3A2F",
    opacity: 0.5,
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
    color: "#F97316",
    fontSize: 14,
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(11, 21, 16, 0.95)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#11221A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#1E3A2F",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "bold",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B1510",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#F8FAFC",
    fontSize: 14,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  modalFlag: {
    fontSize: 22,
    marginRight: 14,
  },
  countryNameText: {
    color: "#F1F5F9",
    fontSize: 15,
    flex: 1,
  },
  countryDialText: {
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#1E3A2F",
  },
});
