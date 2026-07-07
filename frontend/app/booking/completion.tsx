import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookingStore } from '@/store/useBookingStore';
import { useSubmitReview } from '@/hooks/useBookingQuery';
import { COLORS, SHADOWS } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';

const RATING_TAGS = ['punctual', 'professional', 'skilled', 'friendly', 'clean'];

export default function CompletionScreen() {
  const router = useRouter();
  const { activeBookingId, provider, totalAmount, draft } = useBookingStore();
  const submitReviewMutation = useSubmitReview();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'cash'>('gcash');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleProcessPayment = () => {
    setIsProcessingPayment(true);
    // Simulate PayMongo e-wallet integration authorization redirect latency
    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsPaid(true);
      Alert.alert('Payment Success', 'Thank you! Your payment has been processed successfully.');
    }, 1500);
  };

  const handleSubmitReview = async () => {
    if (!activeBookingId) return;

    try {
      await submitReviewMutation.mutateAsync({
        bookingId: activeBookingId,
        rating,
        comment: comment.trim(),
        tags: selectedTags,
      });

      Alert.alert('Thank You', 'Your feedback helps improve FixConnect services.', [
        {
          text: 'Return Home',
          onPress: () => {
            useBookingStore.getState().clearActiveBooking();
            router.replace('/(tabs)');
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to submit review.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Receipt Header Icon */}
        <View style={styles.successHeader}>
          <View style={styles.checkIcon}>
            <Ionicons name="checkmark-done" size={40} color="#FFF" />
          </View>
          <Text style={styles.successTitle}>Job Completed!</Text>
          <Text style={styles.successSubtitle}>
            Your {draft?.service_title || 'service'} has been finalized.
          </Text>
        </View>

        {/* Invoice Receipt breakdown */}
        <View style={[styles.invoiceCard, SHADOWS.small]}>
          <Text style={styles.cardTitle}>Invoicing Receipt</Text>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Base Rate</Text>
            <Text style={styles.invoiceValue}>{formatCurrency(totalAmount - Math.round(totalAmount * 0.15))}</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Platform Fee (15%)</Text>
            <Text style={styles.invoiceValue}>{formatCurrency(Math.round(totalAmount * 0.15))}</Text>
          </View>
          <View style={[styles.invoiceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Due</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>

        {/* PayMongo Payment Panel */}
        {!isPaid ? (
          <View style={[styles.paymentCard, SHADOWS.small]}>
            <Text style={styles.cardTitle}>Select Payment Method</Text>
            <View style={styles.payMethods}>
              <Pressable
                onPress={() => setPaymentMethod('gcash')}
                style={[
                  styles.payMethodItem,
                  paymentMethod === 'gcash' && styles.payMethodActive,
                ]}
              >
                <Ionicons
                  name="wallet"
                  size={20}
                  color={paymentMethod === 'gcash' ? COLORS.primary[600] : COLORS.text.secondary}
                />
                <Text style={[styles.payMethodText, paymentMethod === 'gcash' && styles.activeText]}>
                  GCash / E-Wallet
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setPaymentMethod('cash')}
                style={[
                  styles.payMethodItem,
                  paymentMethod === 'cash' && styles.payMethodActive,
                ]}
              >
                <Ionicons
                  name="cash"
                  size={20}
                  color={paymentMethod === 'cash' ? COLORS.primary[600] : COLORS.text.secondary}
                />
                <Text style={[styles.payMethodText, paymentMethod === 'cash' && styles.activeText]}>
                  Cash Payment
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={handleProcessPayment}
              disabled={isProcessingPayment}
              style={[styles.payBtn, SHADOWS.small]}
            >
              {isProcessingPayment ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.payBtnText}>
                  Pay {formatCurrency(totalAmount)}
                </Text>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={styles.paymentPaidBadge}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary[600]} />
            <Text style={styles.paymentPaidText}>Payment Completed via {paymentMethod.toUpperCase()}</Text>
          </View>
        )}

        {/* Feedback Section */}
        {isPaid && (
          <View style={[styles.feedbackCard, SHADOWS.small]}>
            <Text style={styles.cardTitle}>Rate Your Provider</Text>
            {provider && <Text style={styles.providerName}>How was {provider.name}'s service?</Text>}

            {/* Interactive Stars */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={36}
                    color="#FFA726"
                  />
                </Pressable>
              ))}
            </View>

            {/* Quick tags */}
            <View style={styles.tagsContainer}>
              {RATING_TAGS.map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[
                    styles.tagItem,
                    selectedTags.includes(tag) && styles.tagItemActive,
                  ]}
                >
                  <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>
                    #{tag}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Text comments */}
            <TextInput
              placeholder="Leave a comment about the experience..."
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
            />

            <Pressable
              onPress={handleSubmitReview}
              disabled={submitReviewMutation.isPending}
              style={styles.submitReviewBtn}
            >
              {submitReviewMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitReviewBtnText}>Submit Feedback</Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  successHeader: {
    alignItems: 'center',
    marginVertical: 24,
  },
  checkIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  successSubtitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  invoiceCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  invoiceLabel: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  invoiceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary[700],
  },
  paymentCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  payMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  payMethodItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
  },
  payMethodActive: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  payMethodText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text.secondary,
  },
  activeText: {
    color: COLORS.primary[700],
  },
  payBtn: {
    backgroundColor: COLORS.accent.DEFAULT,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  payBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  paymentPaidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[50],
    borderWidth: 1,
    borderColor: COLORS.primary[200],
    borderRadius: 14,
    padding: 16,
    gap: 8,
    marginBottom: 16,
    justifyContent: 'center',
  },
  paymentPaidText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary[700],
  },
  feedbackCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  providerName: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 14,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tagItem: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagItemActive: {
    backgroundColor: COLORS.primary[500],
  },
  tagText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  tagTextActive: {
    color: '#FFF',
  },
  commentInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: COLORS.text.primary,
    height: 72,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitReviewBtn: {
    backgroundColor: COLORS.primary[600],
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitReviewBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
