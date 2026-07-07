import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';

/**
 * Fetch all available services.
 */
export function useServices(category?: string) {
  return useQuery({
    queryKey: ['services', category],
    queryFn: async () => {
      const params = category ? { category } : {};
      const { data } = await api.get('/services', { params });
      return data.services;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch active booking for the current user.
 */
export function useActiveBooking() {
  return useQuery({
    queryKey: ['booking', 'active'],
    queryFn: async () => {
      const { data } = await api.get('/bookings/active');
      return data.booking;
    },
    refetchInterval: 10000, // Poll every 10s as fallback
  });
}

/**
 * Fetch booking history with pagination.
 */
export function useBookingHistory(page: number = 1) {
  return useQuery({
    queryKey: ['bookings', 'history', page],
    queryFn: async () => {
      const { data } = await api.get('/bookings/history', { params: { page, limit: 10 } });
      return data;
    },
  });
}

/**
 * Fetch a single booking by ID.
 */
export function useBookingById(bookingId: string) {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const { data } = await api.get(`/bookings/${bookingId}`);
      return data.booking;
    },
    enabled: !!bookingId,
  });
}

/**
 * Create a booking draft.
 */
export function useCreateDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draftData: {
      service_id: string;
      latitude: number;
      longitude: number;
      formatted_address: string;
      problem_description: string;
      attachment_urls?: string[];
      scheduled_at?: string;
    }) => {
      const { data } = await api.post('/bookings/draft', draftData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', 'active'] });
    },
  });
}

/**
 * Request a provider for a booking (DRAFT -> SEARCHING).
 */
export function useRequestProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data } = await api.post(`/bookings/${bookingId}/request`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', 'active'] });
    },
  });
}

/**
 * Cancel a booking.
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason?: string }) => {
      const { data } = await api.post(`/bookings/${bookingId}/cancel`, { reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/**
 * Submit a review for a completed booking.
 */
export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      rating,
      comment,
      tags,
    }: {
      bookingId: string;
      rating: number;
      comment?: string;
      tags?: string[];
    }) => {
      const { data } = await api.post(`/bookings/${bookingId}/review`, {
        rating,
        comment,
        tags,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/**
 * Search addresses via LocationIQ proxy.
 */
export function useAddressSearch(query: string) {
  return useQuery({
    queryKey: ['address', query],
    queryFn: async () => {
      const { data } = await api.get('/location/search', { params: { q: query } });
      return data.results;
    },
    enabled: query.length >= 3,
    staleTime: 30000,
  });
}
