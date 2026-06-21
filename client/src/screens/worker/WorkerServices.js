import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Alert,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { COLORS, FONTS, SPACING, ROUNDING } from '../../theme';
import { getApiClient } from '../../utils/api';
import useStore from '../../store/useStore';

const ServiceSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  category: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
  price: Yup.number().positive('Must be positive').required('Required'),
  duration: Yup.string().required('Required'),
});

const WorkerServices = () => {
  const { getToken } = useAuth();
  const { user } = useStore();
  const queryClient = useQueryClient();
  const [editingService, setEditingService] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const insets = useSafeAreaInsets();

  // Get services offered by this worker
  const { data: services, isLoading } = useQuery({
    queryKey: ['worker-services', user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.get(`/services/worker/${user._id}`);
      return response.data;
    },
    enabled: !!user?._id
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (values) => {
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.post('/services', values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsFormOpen(false);
    }
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, values }) => {
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.put(`/services/${id}`, values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setEditingService(null);
      setIsFormOpen(false);
    }
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (id) => {
      const token = await getToken();
      const client = getApiClient(token);
      const response = await client.delete(`/services/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    }
  });

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteServiceMutation.mutate(id) },
      ]
    );
  };

  const handleEditPress = (service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const renderServiceItem = ({ item }) => (
    <View style={styles.serviceItem}>
      <View style={styles.itemHeader}>
        <View>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.serviceMeta}>{item.category} • {item.duration}</Text>
        </View>
        <Text style={styles.servicePrice}>${item.price}</Text>
      </View>
      <Text style={styles.serviceDesc}>{item.description}</Text>
      
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={[styles.btn, styles.deleteBtn]}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.btn, styles.editBtn]}
          onPress={() => handleEditPress(item)}
        >
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), paddingBottom: SPACING.md }]}>
        <Text style={styles.title}>My Services</Text>
        {!isFormOpen && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              setEditingService(null);
              setIsFormOpen(true);
            }}
          >
            <Text style={styles.addButtonText}>+ Add Service</Text>
          </TouchableOpacity>
        )}
      </View>

      {isFormOpen ? (
        <ScrollView contentContainerStyle={[styles.formContainer, { paddingBottom: Math.max(insets.bottom, 40) }]}>
          <Text style={styles.formSectionTitle}>
            {editingService ? 'Edit Service' : 'Add New Service Listing'}
          </Text>

          <Formik
            initialValues={{
              name: editingService?.name || '',
              category: editingService?.category || user?.workerDetails?.category || 'Plumbing',
              description: editingService?.description || '',
              price: editingService?.price?.toString() || '',
              duration: editingService?.duration || '1 hour',
            }}
            validationSchema={ServiceSchema}
            onSubmit={(values) => {
              const payload = {
                ...values,
                price: parseFloat(values.price),
              };
              if (editingService) {
                updateServiceMutation.mutate({ id: editingService._id, values: payload });
              } else {
                createServiceMutation.mutate(payload);
              }
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View>
                <Text style={styles.label}>Service Display Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Toilet unclogging & clean"
                  placeholderTextColor={COLORS.textMuted}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  value={values.name}
                />
                {errors.name && touched.name && <Text style={styles.fieldError}>{errors.name}</Text>}

                <Text style={styles.label}>Category</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Plumbing, Electrical, Cleaning..."
                  placeholderTextColor={COLORS.textMuted}
                  onChangeText={handleChange('category')}
                  onBlur={handleBlur('category')}
                  value={values.category}
                />
                {errors.category && touched.category && <Text style={styles.fieldError}>{errors.category}</Text>}

                <Text style={styles.label}>Price (USD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="40"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  onChangeText={handleChange('price')}
                  onBlur={handleBlur('price')}
                  value={values.price}
                />
                {errors.price && touched.price && <Text style={styles.fieldError}>{errors.price}</Text>}

                <Text style={styles.label}>Estimated Duration</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 1.5 hours"
                  placeholderTextColor={COLORS.textMuted}
                  onChangeText={handleChange('duration')}
                  onBlur={handleBlur('duration')}
                  value={values.duration}
                />
                {errors.duration && touched.duration && <Text style={styles.fieldError}>{errors.duration}</Text>}

                <Text style={styles.label}>Detailed Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your service process, materials, etc..."
                  placeholderTextColor={COLORS.textMuted}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  value={values.description}
                  multiline
                  numberOfLines={4}
                />
                {errors.description && touched.description && <Text style={styles.fieldError}>{errors.description}</Text>}

                <View style={styles.formActions}>
                  <TouchableOpacity 
                    style={[styles.formBtn, styles.cancelFormBtn]}
                    onPress={() => setIsFormOpen(false)}
                  >
                    <Text style={styles.cancelFormText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.formBtn, styles.submitFormBtn]}
                    onPress={handleSubmit}
                    disabled={createServiceMutation.isLoading || updateServiceMutation.isLoading}
                  >
                    {createServiceMutation.isLoading || updateServiceMutation.isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitFormText}>Save Listing</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      ) : isLoading ? (
        <View style={{ padding: SPACING.md }}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : services && services.length > 0 ? (
        <FlatList
          data={services}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[styles.listContainer, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You haven't listed any services yet. Click + Add Service to start.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.secondary,
    borderBottomLeftRadius: ROUNDING.lg,
    borderBottomRightRadius: ROUNDING.lg,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#fff',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: ROUNDING.sm,
    ...COLORS.glassShadow,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  listContainer: {
    padding: SPACING.md,
  },
  serviceItem: {
    backgroundColor: '#fff',
    borderRadius: ROUNDING.md,
    padding: SPACING.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...COLORS.cardShadow,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  serviceMeta: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.primaryDark,
  },
  serviceDesc: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginTop: 10,
    marginBottom: 12,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  btn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: ROUNDING.sm,
    marginLeft: 10,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  deleteBtnText: {
    color: '#ef4444',
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  editBtn: {
    backgroundColor: COLORS.secondary,
  },
  editBtnText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  formContainer: {
    padding: SPACING.md,
  },
  formSectionTitle: {
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
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
  },
  formBtn: {
    flex: 1,
    height: 48,
    borderRadius: ROUNDING.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelFormBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  cancelFormText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  submitFormBtn: {
    backgroundColor: COLORS.primary,
    ...COLORS.glassShadow,
  },
  submitFormText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});

export default WorkerServices;
