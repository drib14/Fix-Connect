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
import { useAuth } from '@clerk/clerk-expo';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { COLORS, FONTS, SPACING, ROUNDING } from '../../theme';
import { getApiClient } from '../../utils/api';

const BookingSchema = Yup.object().shape({
  date: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
    .required('Required'),
  time: Yup.string()
    .matches(/^\d{2}:\d{2}$/, 'Use HH:MM format')
    .required('Required'),
  notes: Yup.string().max(300, 'Keep notes under 300 characters'),
});

const BookingScreen = ({ route, navigation }) => {
  const { service, worker } = route.params;
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleBookingSubmit = async (values) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const token = await getToken();
      const client = getApiClient(token);
      
      const payload = {
        serviceId: service._id,
        date: values.date,
        time: values.time,
        notes: values.notes,
      };

      await client.post('/bookings', payload);
      
      // Successfully booked, navigate to Bookings tab/list
      navigation.navigate('CustomerBookings');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Info Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Booking Service</Text>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.workerName}>Offered by: {worker.name}</Text>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Estimated Cost</Text>
            <Text style={styles.priceValue}>${service.price}</Text>
          </View>
        </View>

        {/* Booking Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Schedule & Details</Text>
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <Formik
            initialValues={{ date: '2026-06-25', time: '10:00', notes: '' }}
            validationSchema={BookingSchema}
            onSubmit={handleBookingSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View>
                <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-06-25"
                  placeholderTextColor={COLORS.textMuted}
                  onChangeText={handleChange('date')}
                  onBlur={handleBlur('date')}
                  value={values.date}
                />
                {errors.date && touched.date && <Text style={styles.fieldError}>{errors.date}</Text>}

                <Text style={styles.label}>Time (HH:MM / 24-hr format)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="14:30"
                  placeholderTextColor={COLORS.textMuted}
                  onChangeText={handleChange('time')}
                  onBlur={handleBlur('time')}
                  value={values.time}
                />
                {errors.time && touched.time && <Text style={styles.fieldError}>{errors.time}</Text>}

                <Text style={styles.label}>Additional Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell the worker about details, directions, or constraints..."
                  placeholderTextColor={COLORS.textMuted}
                  onChangeText={handleChange('notes')}
                  onBlur={handleBlur('notes')}
                  value={values.notes}
                  multiline
                  numberOfLines={4}
                />
                {errors.notes && touched.notes && <Text style={styles.fieldError}>{errors.notes}</Text>}

                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Confirm Appointment</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>
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
  scrollContent: {
    padding: SPACING.md,
  },
  summaryCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: ROUNDING.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...COLORS.glassShadow,
  },
  summaryLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#fff',
  },
  workerName: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.primaryLight,
    marginTop: 2,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.primaryLight,
  },
  priceValue: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: ROUNDING.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...COLORS.cardShadow,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.secondary,
    marginTop: 12,
    marginBottom: 6,
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
  textArea: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: 'top',
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
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: ROUNDING.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    ...COLORS.glassShadow,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});

export default BookingScreen;
