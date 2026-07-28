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
  Alert,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import {
  Wrench,
  Award,
  FileCheck,
  Plus,
  Trash2,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ChevronRight,
  Sparkles,
} from "lucide-react-native";

const AVAILABLE_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Aircon/HVAC",
  "Carpentry",
  "Appliance Repair",
  "Masonry",
  "Auto Repair",
  "Cleaning",
  "Painting",
  "General Handyman",
];

const DOCUMENT_TYPES = [
  { id: "TESDA_NC2_CERTIFICATE", label: "TESDA / NC II Certificate", icon: "📄" },
  { id: "DEGREE_CERTIFICATE", label: "Degree / College Certification", icon: "🎓" },
  { id: "GOVERNMENT_ID", label: "Government Issued Valid ID", icon: "🪪" },
  { id: "WORK_LICENSE", label: "Work License / Barangay Clearance", icon: "📜" },
  { id: "VOCATIONAL_CERTIFICATE", label: "Vocational Training Certificate", icon: "🛠️" },
  { id: "OTHER", label: "Other Trade Document", icon: "📂" },
];

export default function ProviderOnboardingScreen() {
  const { onboardProvider, user } = useContext(AuthContext);
  const [step, setStep] = useState(1);

  // Step 1: Specialization & Bio
  const [selectedCategories, setSelectedCategories] = useState(["Plumbing", "Electrical"]);
  const [yearsExp, setYearsExp] = useState("3");
  const [bio, setBio] = useState("");

  // Step 2: Documents & Certifications
  const [documents, setDocuments] = useState([
    {
      docType: "TESDA_NC2_CERTIFICATE",
      title: "TESDA NC II Plumbing Certification",
      fileUrl: "https://fixconnect.ph/docs/sample_tesda_nc2.pdf",
    },
    {
      docType: "GOVERNMENT_ID",
      title: "Government Issued Driver's License / UMID",
      fileUrl: "https://fixconnect.ph/docs/sample_gov_id.jpg",
    },
  ]);
  const [newDocType, setNewDocType] = useState("DEGREE_CERTIFICATE");
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");

  // Step 3: Location
  const [address, setAddress] = useState(user?.location?.address || "");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length === 1) {
        Alert.alert("Select Category", "You must select at least 1 trade category.");
        return;
      }
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      if (selectedCategories.length >= 10) {
        Alert.alert("Limit Reached", "Maximum 10 service categories allowed.");
        return;
      }
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleAddDocument = () => {
    if (!newDocTitle.trim()) {
      Alert.alert("Document Title Required", "Please provide a description or title for the document (e.g. TESDA NC II Plumbing Cert).");
      return;
    }

    const docTypeLabel = DOCUMENT_TYPES.find((d) => d.id === newDocType)?.label || "Document";
    const fileAttachment = newDocUrl.trim() || `https://fixconnect.ph/uploads/${Date.now()}_${newDocType.toLowerCase()}.pdf`;

    setDocuments([
      ...documents,
      {
        docType: newDocType,
        title: newDocTitle.trim(),
        fileUrl: fileAttachment,
      },
    ]);

    setNewDocTitle("");
    setNewDocUrl("");
    Alert.alert("Document Added", `${docTypeLabel} attached successfully for verification review.`);
  };

  const handleRemoveDocument = (index) => {
    const updated = [...documents];
    updated.splice(index, 1);
    setDocuments(updated);
  };

  const handleSubmitOnboarding = async () => {
    if (selectedCategories.length === 0) {
      setErrorMsg("Please select at least one trade category");
      setStep(1);
      return;
    }
    if (documents.length === 0) {
      setErrorMsg("Please upload at least 1 certification document or valid ID (e.g. TESDA NC II, Degree, Government ID)");
      setStep(2);
      return;
    }
    if (!address.trim()) {
      setErrorMsg("Please enter your primary service operating area address");
      setStep(3);
      return;
    }

    setErrorMsg("");
    setLoading(true);
    try {
      await onboardProvider({
        serviceCategories: selectedCategories,
        yearsExperience: parseInt(yearsExp, 10) || 0,
        bio: bio.trim(),
        documents,
        address: address.trim(),
        coordinates: [120.9842, 14.5995],
      });
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit provider onboarding.");
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
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.iconBadge}>
            <Wrench color="#F97316" size={38} />
          </View>
          <Text style={styles.title}>Provider Verification</Text>
          <Text style={styles.subtitle}>Complete worker onboarding & submit certifications</Text>

          {/* Stepper indicator */}
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepDot, step === 1 && styles.stepDotActive]}
              onPress={() => setStep(1)}
            >
              <Text style={[styles.stepText, step === 1 && styles.stepTextActive]}>1. Trade</Text>
            </TouchableOpacity>
            <View style={styles.stepDivider} />
            <TouchableOpacity
              style={[styles.stepDot, step === 2 && styles.stepDotActive]}
              onPress={() => setStep(2)}
            >
              <Text style={[styles.stepText, step === 2 && styles.stepTextActive]}>2. Papers & NCII</Text>
            </TouchableOpacity>
            <View style={styles.stepDivider} />
            <TouchableOpacity
              style={[styles.stepDot, step === 3 && styles.stepDotActive]}
              onPress={() => setStep(3)}
            >
              <Text style={[styles.stepText, step === 3 && styles.stepTextActive]}>3. Review</Text>
            </TouchableOpacity>
          </View>
        </View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        {/* STEP 1: Trade Specialization & Experience */}
        {step === 1 && (
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Step 1: Trade Specializations & Experience</Text>
            <Text style={styles.instructions}>
              Select your primary service skills and years of technical trade experience.
            </Text>

            <Text style={styles.inputLabel}>Select Your Trade Categories:</Text>
            <View style={styles.categoryGrid}>
              {AVAILABLE_CATEGORIES.map((cat) => {
                const selected = selectedCategories.includes(cat);
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => toggleCategory(cat)}
                  >
                    <CheckCircle2 color={selected ? "#22C55E" : "#64748B"} size={16} />
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Years of Trade Experience:</Text>
            <View style={styles.inputWrapper}>
              <Award color="#F97316" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 5"
                placeholderTextColor="#64748B"
                keyboardType="number-pad"
                value={yearsExp}
                onChangeText={setYearsExp}
              />
            </View>

            <Text style={styles.inputLabel}>Provider Bio / Summary:</Text>
            <View style={[styles.inputWrapper, { height: 90, alignItems: "flex-start", paddingTop: 10 }]}>
              <TextInput
                style={styles.input}
                placeholder="Describe your qualifications, skills, tools, and background..."
                placeholderTextColor="#64748B"
                value={bio}
                onChangeText={setBio}
                multiline
              />
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
              <Text style={styles.nextBtnText}>Next: Upload Certifications</Text>
              <ChevronRight color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: Certification & Required Document Uploads */}
        {step === 2 && (
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Step 2: Submit Certifications & Papers</Text>
            <Text style={styles.instructions}>
              Upload mandatory verification documents: **Degree Certifications**, **TESDA / NC II Certifications**, **Government IDs**, or trade licenses.
            </Text>

            {/* List of Attached Documents */}
            <Text style={styles.inputLabel}>Attached Verification Documents ({documents.length}):</Text>
            {documents.length === 0 ? (
              <View style={styles.emptyDocBox}>
                <FileText color="#64748B" size={32} />
                <Text style={styles.emptyDocText}>No documents attached yet. Please add your credentials below.</Text>
              </View>
            ) : (
              documents.map((doc, idx) => (
                <View key={idx} style={styles.docItemCard}>
                  <View style={styles.docItemIconBox}>
                    <FileCheck color="#22C55E" size={22} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docItemTitle}>{doc.title}</Text>
                    <Text style={styles.docItemType}>
                      {DOCUMENT_TYPES.find((d) => d.id === doc.docType)?.label || doc.docType}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveDocument(idx)}>
                    <Trash2 color="#EF4444" size={18} />
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* Form to Attach New Document */}
            <View style={styles.addDocSection}>
              <Text style={styles.addDocHeading}>Attach New Credential Document:</Text>

              {/* Doc Type Selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {DOCUMENT_TYPES.map((dt) => (
                  <TouchableOpacity
                    key={dt.id}
                    style={[styles.docTypePill, newDocType === dt.id && styles.docTypePillActive]}
                    onPress={() => setNewDocType(dt.id)}
                  >
                    <Text style={styles.docTypeIcon}>{dt.icon}</Text>
                    <Text style={[styles.docTypeLabel, newDocType === dt.id && styles.docTypeLabelActive]}>
                      {dt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextInput
                style={styles.docInput}
                placeholder="Document Title (e.g. TESDA NC II Plumbing Cert, BS Electrical Eng Degree)"
                placeholderTextColor="#64748B"
                value={newDocTitle}
                onChangeText={setNewDocTitle}
              />

              <TextInput
                style={[styles.docInput, { marginTop: 8 }]}
                placeholder="File URL / File Attachment Link (Optional)"
                placeholderTextColor="#64748B"
                value={newDocUrl}
                onChangeText={setNewDocUrl}
              />

              <TouchableOpacity style={styles.addDocBtn} onPress={handleAddDocument}>
                <Plus color="#22C55E" size={18} />
                <Text style={styles.addDocBtnText}>Attach Credential File</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.navRow}>
              <TouchableOpacity style={styles.prevBtn} onPress={() => setStep(1)}>
                <Text style={styles.prevBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.nextBtn, { flex: 1 }]} onPress={() => setStep(3)}>
                <Text style={styles.nextBtnText}>Next: Location & Submit</Text>
                <ChevronRight color="#FFFFFF" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 3: Coverage Location & Final Submission */}
        {step === 3 && (
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Step 3: Operating Location & Final Review</Text>

            <Text style={styles.inputLabel}>Primary Operating Service Address:</Text>
            <View style={[styles.inputWrapper, { height: 80, alignItems: "flex-start", paddingTop: 10 }]}>
              <MapPin color="#F97316" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 456 Taft Avenue, Malate, Manila"
                placeholderTextColor="#64748B"
                value={address}
                onChangeText={setAddress}
                multiline
              />
            </View>

            {/* Summary Review */}
            <View style={styles.reviewCard}>
              <Text style={styles.reviewHeader}>Provider Verification Summary</Text>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Trades:</Text>
                <Text style={styles.reviewVal}>{selectedCategories.join(", ")}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Experience:</Text>
                <Text style={styles.reviewVal}>{yearsExp} Year(s)</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Certifications:</Text>
                <Text style={styles.reviewVal}>{documents.length} File(s) Uploaded</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <ShieldCheck color="#22C55E" size={20} />
              <Text style={styles.infoBoxText}>
                Upon submission, your credentials will be marked as `PENDING_VERIFICATION`. Our dispatch team verifies all TESDA NCII certificates & degree papers before issuing full verified status.
              </Text>
            </View>

            <View style={styles.navRow}>
              <TouchableOpacity style={styles.prevBtn} onPress={() => setStep(2)}>
                <Text style={styles.prevBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, { flex: 1 }]}
                onPress={handleSubmitOnboarding}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Sparkles color="#FFFFFF" size={18} style={{ marginRight: 6 }} />
                    <Text style={styles.submitBtnText}>Submit Verification</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(249, 115, 22, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "rgba(249, 115, 22, 0.3)",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#F8FAFC",
  },
  subtitle: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 2,
    textAlign: "center",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    backgroundColor: "#11221A",
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#1E3A2F",
  },
  stepDot: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  stepDotActive: {
    backgroundColor: "rgba(249, 115, 22, 0.2)",
  },
  stepText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  stepTextActive: {
    color: "#F97316",
    fontWeight: "700",
  },
  stepDivider: {
    width: 12,
    height: 1,
    backgroundColor: "#1E3A2F",
  },
  errorText: {
    color: "#EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 10,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
  },
  formCard: {
    backgroundColor: "#11221A",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E3A2F",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#F8FAFC",
    marginBottom: 4,
  },
  instructions: {
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 18,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#CBD5E1",
    marginBottom: 8,
    marginTop: 6,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B1510",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    gap: 6,
  },
  chipSelected: {
    borderColor: "#22C55E",
    backgroundColor: "rgba(34, 197, 94, 0.12)",
  },
  chipText: {
    color: "#94A3B8",
    fontSize: 13,
  },
  chipTextSelected: {
    color: "#22C55E",
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B1510",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#F8FAFC",
    fontSize: 14,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F97316",
    borderRadius: 12,
    height: 50,
    marginTop: 10,
    gap: 8,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyDocBox: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B1510",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    marginBottom: 16,
    gap: 8,
  },
  emptyDocText: {
    color: "#64748B",
    fontSize: 12,
    textAlign: "center",
  },
  docItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B1510",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    marginBottom: 10,
    gap: 12,
  },
  docItemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  docItemTitle: {
    color: "#F1F5F9",
    fontSize: 13,
    fontWeight: "600",
  },
  docItemType: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 2,
  },
  addDocSection: {
    backgroundColor: "#0B1510",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    marginTop: 8,
    marginBottom: 16,
  },
  addDocHeading: {
    color: "#22C55E",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  docTypePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#11221A",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    gap: 6,
  },
  docTypePillActive: {
    borderColor: "#22C55E",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
  },
  docTypeIcon: {
    fontSize: 14,
  },
  docTypeLabel: {
    color: "#94A3B8",
    fontSize: 12,
  },
  docTypeLabelActive: {
    color: "#22C55E",
    fontWeight: "600",
  },
  docInput: {
    backgroundColor: "#11221A",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    color: "#F8FAFC",
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
  },
  addDocBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderRadius: 10,
    height: 42,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#22C55E",
    gap: 6,
  },
  addDocBtnText: {
    color: "#22C55E",
    fontSize: 13,
    fontWeight: "600",
  },
  navRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  prevBtn: {
    backgroundColor: "#0B1510",
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E3A2F",
  },
  prevBtnText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  reviewCard: {
    backgroundColor: "#0B1510",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1E3A2F",
    marginBottom: 16,
    gap: 8,
  },
  reviewHeader: {
    color: "#F97316",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reviewLabel: {
    color: "#94A3B8",
    fontSize: 12,
  },
  reviewVal: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "600",
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
    marginBottom: 16,
  },
  infoBoxText: {
    color: "#A7F3D0",
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
});
