import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '@/components/FormInput';
import { COLORS, SHADOWS } from '@/constants/theme';
import api from '@/utils/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 State
  const [email, setEmail] = useState('');

  // Step 2 State (6 Digit OTP)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  // Step 3 State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 1: Send OTP code
  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Field', 'Please enter your email address.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', {
        email: email.trim(),
      });
      setIsLoading(false);
      Alert.alert('Code Sent', response.data.message || 'Verification code sent.');
      setStep(2);
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert(
        'Request Failed',
        err.response?.data?.message || 'Failed to request password reset code.'
      );
    }
  };

  // Step 2: Handle OTP input change
  const handleOtpChange = (text: string, index: number) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = text.slice(-1); // Only allow one character
    setOtp(updatedOtp);

    // Auto-focus next input
    if (text && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      // If current input is empty, clear previous input and focus it
      if (!otp[index] && index > 0) {
        const updatedOtp = [...otp];
        updatedOtp[index - 1] = '';
        setOtp(updatedOtp);
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  // Step 2: Verify OTP code
  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      Alert.alert('Incomplete Code', 'Please enter the full 6-digit code.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        email: email.trim(),
        otp: otpCode,
      });
      setIsLoading(false);
      Alert.alert('Verified', response.data.message || 'OTP verified successfully.');
      setStep(3);
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert(
        'Verification Failed',
        err.response?.data?.message || 'Invalid or expired verification code.'
      );
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in both fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.join(''),
        newPassword,
      });
      setIsLoading(false);
      Alert.alert('Success', response.data.message || 'Password reset successful!', [
        {
          text: 'Sign In Now',
          onPress: () => router.replace('/(auth)/login'),
        },
      ]);
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert(
        'Reset Failed',
        err.response?.data?.message || 'Failed to reset password.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </Pressable>

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {step === 1 && 'Enter your email address to receive a 6-digit verification code.'}
            {step === 2 && `We've sent a 6-digit verification code to ${email}`}
            {step === 3 && 'Create a strong, new password for your FixConnect account.'}
          </Text>
        </View>

        {/* Step 1 Content */}
        {step === 1 && (
          <View style={styles.form}>
            <FormInput
              label="Email Address"
              icon="mail-outline"
              placeholder="yourname@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Pressable
              onPress={handleSendOtp}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                isLoading && { opacity: 0.7 },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnText}>Send Code</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Step 2 Content */}
        {step === 2 && (
          <View style={styles.form}>
            <Text style={styles.otpLabel}>6-Digit Verification Code</Text>
            <View style={styles.otpContainer}>
              {otp.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={(ref) => {
                    otpRefs.current[idx] = ref;
                  }}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, idx)}
                  onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            <Pressable
              onPress={handleVerifyOtp}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                isLoading && { opacity: 0.7 },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnText}>Verify Code</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => setStep(1)}
              style={styles.textBtn}
            >
              <Text style={styles.textBtnLabel}>Edit Email Address</Text>
            </Pressable>
          </View>
        )}

        {/* Step 3 Content */}
        {step === 3 && (
          <View style={styles.form}>
            <FormInput
              label="New Password"
              icon="lock-closed-outline"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <FormInput
              label="Confirm New Password"
              icon="shield-checkmark-outline"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Pressable
              onPress={handleResetPassword}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                isLoading && { opacity: 0.7 },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnText}>Reset Password</Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  header: {
    marginBottom: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginTop: 8,
  },
  form: {
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary[600],
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    ...SHADOWS.small,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  otpLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
    marginLeft: 4,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  otpInput: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: COLORS.primary[500],
    backgroundColor: '#FFF',
  },
  textBtn: {
    alignSelf: 'center',
    marginTop: 18,
    paddingVertical: 4,
  },
  textBtnLabel: {
    fontSize: 14,
    color: COLORS.primary[600],
    fontWeight: '700',
  },
});
