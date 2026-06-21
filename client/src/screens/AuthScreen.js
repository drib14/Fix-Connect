import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { COLORS, FONTS, SPACING, ROUNDING } from '../theme';
import { getApiClient } from '../utils/api';
import useStore from '../store/useStore';

// Input schemas
const SignInSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too short!').required('Required'),
});

const SignUpSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too short!').required('Required'),
  role: Yup.string().oneOf(['customer', 'worker']).required('Required'),
});

const VerificationSchema = Yup.object().shape({
  code: Yup.string().length(6, 'Code must be 6 digits').required('Required'),
});

const AuthScreen = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUpDetails, setSignUpDetails] = useState(null); // cache details for sync

  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();
  const setUser = useStore((state) => state.setUser);

  // Sync user profile to MongoDB
  const syncUserProfile = async (clerkToken, details) => {
    try {
      const client = getApiClient(clerkToken);
      const response = await client.post('/auth/sync', {
        email: details.email,
        name: details.name,
        role: details.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(details.name)}&background=10b981&color=fff`
      });
      setUser(response.data);
    } catch (error) {
      console.error('Database profile synchronization failed:', error.message);
      setErrorMessage('Account verified, but profile sync failed. Please contact support.');
    }
  };

  // Sign In submit
  const handleSignIn = async (values) => {
    if (!isSignInLoaded) return;
    setLoading(true);
    setErrorMessage('');
    
    try {
      const completeSignIn = await signIn.create({
        identifier: values.email,
        password: values.password,
      });

      await setSignInActive({ session: completeSignIn.createdSessionId });
      
      // Get auth token and fetch Mongo DB user details
      const token = await completeSignIn.firstFactorVerification?.token || (await signIn.session?.getToken());
      const client = getApiClient(token);
      const response = await client.get('/auth/me');
      setUser(response.data);
    } catch (err) {
      setErrorMessage(err.errors?.[0]?.message || 'Sign in failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Sign Up submit (triggers email verification code)
  const handleSignUp = async (values) => {
    if (!isSignUpLoaded) return;
    setLoading(true);
    setErrorMessage('');
    setSignUpDetails(values);

    try {
      await signUp.create({
        emailAddress: values.email,
        password: values.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      setErrorMessage(err.errors?.[0]?.message || 'Registration failed. Check details.');
    } finally {
      setLoading(false);
    }
  };

  // Verification code submit
  const handleVerify = async (values) => {
    if (!isSignUpLoaded) return;
    setLoading(true);
    setErrorMessage('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: values.code,
      });

      if (completeSignUp.status !== 'complete') {
        throw new Error('Verification incomplete. Try again.');
      }

      await setSignUpActive({ session: completeSignUp.createdSessionId });

      // Retrieve session token and sync profile
      const sessionToken = await signUp.session?.getToken();
      await syncUserProfile(sessionToken, signUpDetails);
    } catch (err) {
      setErrorMessage(err.errors?.[0]?.message || err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>Verification</Text>
            <Text style={styles.subtitle}>Enter the 6-digit code sent to your email</Text>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Formik
              initialValues={{ code: '' }}
              validationSchema={VerificationSchema}
              onSubmit={handleVerify}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.formContainer}>
                  <Text style={styles.label}>Verification Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123456"
                    placeholderTextColor={COLORS.textMuted}
                    onChangeText={handleChange('code')}
                    onBlur={handleBlur('code')}
                    value={values.code}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  {errors.code && touched.code && <Text style={styles.fieldError}>{errors.code}</Text>}

                  <TouchableOpacity 
                    style={styles.primaryButton} 
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.textLight} />
                    ) : (
                      <Text style={styles.buttonText}>Verify Account</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.textButton} 
                    onPress={() => setPendingVerification(false)}
                  >
                    <Text style={styles.textButtonText}>Back to Sign Up</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>{isSignUpMode ? 'Join FixConnect' : 'Welcome Back'}</Text>
          <Text style={styles.subtitle}>
            {isSignUpMode ? 'Register to book or offer home services' : 'Log in to manage bookings'}
          </Text>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {isSignUpMode ? (
            // Sign Up Form
            <Formik
              initialValues={{ name: '', email: '', password: '', role: 'customer' }}
              validationSchema={SignUpSchema}
              onSubmit={handleSignUp}
            >
              {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
                <View style={styles.formContainer}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor={COLORS.textMuted}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    value={values.name}
                  />
                  {errors.name && touched.name && <Text style={styles.fieldError}>{errors.name}</Text>}

                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="johndoe@email.com"
                    placeholderTextColor={COLORS.textMuted}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  {errors.email && touched.email && <Text style={styles.fieldError}>{errors.email}</Text>}

                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Min. 6 characters"
                    placeholderTextColor={COLORS.textMuted}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                  {errors.password && touched.password && <Text style={styles.fieldError}>{errors.password}</Text>}

                  <Text style={styles.label}>Select Role</Text>
                  <View style={styles.roleContainer}>
                    <TouchableOpacity
                      style={[styles.roleButton, values.role === 'customer' && styles.roleButtonActive]}
                      onPress={() => setFieldValue('role', 'customer')}
                    >
                      <Text style={[styles.roleButtonText, values.role === 'customer' && styles.roleButtonTextActive]}>
                        Customer
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roleButton, values.role === 'worker' && styles.roleButtonActive]}
                      onPress={() => setFieldValue('role', 'worker')}
                    >
                      <Text style={[styles.roleButtonText, values.role === 'worker' && styles.roleButtonTextActive]}>
                        Worker
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity 
                    style={styles.primaryButton} 
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.textLight} />
                    ) : (
                      <Text style={styles.buttonText}>Register Now</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => setIsSignUpMode(false)}>
                      <Text style={styles.toggleLink}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          ) : (
            // Sign In Form
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={SignInSchema}
              onSubmit={handleSignIn}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.formContainer}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="johndoe@email.com"
                    placeholderTextColor={COLORS.textMuted}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  {errors.email && touched.email && <Text style={styles.fieldError}>{errors.email}</Text>}

                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your password"
                    placeholderTextColor={COLORS.textMuted}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                  {errors.password && touched.password && <Text style={styles.fieldError}>{errors.password}</Text>}

                  <TouchableOpacity 
                    style={styles.primaryButton} 
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.textLight} />
                    ) : (
                      <Text style={styles.buttonText}>Sign In</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>New to FixConnect? </Text>
                    <TouchableOpacity onPress={() => setIsSignUpMode(true)}>
                      <Text style={styles.toggleLink}>Register</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDING.lg,
    padding: SPACING.xl,
    ...COLORS.cardShadow,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 26,
    color: COLORS.secondary,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: COLORS.secondary,
    fontFamily: FONTS.medium,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: ROUNDING.md,
    paddingHorizontal: SPACING.md,
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textDark,
    backgroundColor: '#fff',
  },
  fieldError: {
    fontSize: 12,
    color: COLORS.error,
    fontFamily: FONTS.regular,
    marginTop: 4,
  },
  errorText: {
    color: COLORS.error,
    backgroundColor: '#fef2f2',
    padding: SPACING.sm,
    borderRadius: ROUNDING.md,
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontFamily: FONTS.medium,
    fontSize: 13,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: ROUNDING.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  roleButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  roleButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
  },
  roleButtonTextActive: {
    color: COLORS.primaryDark,
    fontFamily: FONTS.bold,
  },
  primaryButton: {
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: ROUNDING.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    ...COLORS.glassShadow,
  },
  buttonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  textButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  textButtonText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  toggleText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  toggleLink: {
    color: COLORS.primaryDark,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});

export default AuthScreen;
