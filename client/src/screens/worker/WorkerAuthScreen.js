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
  Platform,
  Image
} from 'react-native';
import { useSignIn, useSignUp, useOAuth } from '@clerk/clerk-expo';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { COLORS, FONTS, SPACING, ROUNDING } from '../../theme';
import { getApiClient } from '../../utils/api';
import useStore from '../../store/useStore';

// Warm up the browser for OAuth redirect on native
WebBrowser.maybeCompleteAuthSession();

const SignInSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

const SignUpSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too short!').required('Required'),
});

const VerificationSchema = Yup.object().shape({
  code: Yup.string().length(6, 'Code must be 6 digits').required('Required'),
});

const WorkerAuthScreen = ({ navigation }) => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUpDetails, setSignUpDetails] = useState(null);

  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const setUser = useStore((state) => state.setUser);

  // Sync profile to DB
  const syncUserProfile = async (clerkToken, details) => {
    try {
      const client = getApiClient(clerkToken);
      const response = await client.post('/auth/sync', {
        email: details.email,
        name: details.name,
        role: 'worker',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(details.name)}&background=0f172a&color=fff`
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

  // Sign Up submit
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

      const sessionToken = await signUp.session?.getToken();
      await syncUserProfile(sessionToken, signUpDetails);
    } catch (err) {
      setErrorMessage(err.errors?.[0]?.message || err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth flow
  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      // Cache desired role in platform-appropriate storage
      if (Platform.OS === 'web') {
        localStorage.setItem('oauth_selected_role', 'worker');
      } else {
        await SecureStore.setItemAsync('oauth_selected_role', 'worker');
      }

      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/oauth-callback'),
      });

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('Google OAuth Error:', err);
      setErrorMessage(err.message || 'Google authentication failed.');
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
              key="verification-form"
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
                    value={values.code || ''}
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
          <Text style={styles.title}>{isSignUpMode ? 'Offer Home Services' : 'Worker Sign In'}</Text>
          <Text style={styles.subtitle}>
            {isSignUpMode ? 'Register as a professional to find jobs' : 'Log in to manage your jobs'}
          </Text>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {/* Social Logins */}
          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={handleGoogleAuth} 
            disabled={loading}
          >
            <Image 
              source={{ uri: 'https://developers.google.com/static/identity/images/g-logo.png' }} 
              style={styles.googleIcon} 
              resizeMode="contain"
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or use email</Text>
            <View style={styles.dividerLine} />
          </View>

          {isSignUpMode ? (
            // Sign Up Form
            <Formik
              key="signup-form"
              initialValues={{ name: '', email: '', password: '' }}
              validationSchema={SignUpSchema}
              onSubmit={handleSignUp}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.formContainer}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor={COLORS.textMuted}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    value={values.name || ''}
                  />
                  {errors.name && touched.name && <Text style={styles.fieldError}>{errors.name}</Text>}

                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="johndoe@email.com"
                    placeholderTextColor={COLORS.textMuted}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email || ''}
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
                    value={values.password || ''}
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
                      <Text style={styles.buttonText}>Register Account</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Already registered? </Text>
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
              key="signin-form"
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
                    value={values.email || ''}
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
                    value={values.password || ''}
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
                    <Text style={styles.toggleText}>New Worker? </Text>
                    <TouchableOpacity onPress={() => setIsSignUpMode(true)}>
                      <Text style={styles.toggleLink}>Register</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          )}

          <TouchableOpacity 
            style={[styles.textButton, { marginTop: SPACING.md }]} 
            onPress={() => navigation.navigate('Welcome')}
          >
            <Text style={styles.textButtonText}>Change Role Profile</Text>
          </TouchableOpacity>
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
    fontSize: 24,
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
  googleButton: {
    flexDirection: 'row',
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: ROUNDING.md,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }
    }),
  },
  googleIcon: {
    width: 18,
    height: 18,
    marginRight: 12,
  },
  googleButtonText: {
    color: COLORS.textDark,
    fontSize: 15,
    fontFamily: FONTS.medium,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    paddingHorizontal: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.regular,
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
  primaryButton: {
    height: 48,
    backgroundColor: COLORS.secondary,
    borderRadius: ROUNDING.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    ...COLORS.glassShadow,
  },
  buttonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  textButton: {
    alignItems: 'center',
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

export default WorkerAuthScreen;
