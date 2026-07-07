import { create } from 'zustand';

export type BookingStatus =
  | 'DRAFT'
  | 'SEARCHING'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type ProviderInfo = {
  _id: string;
  name: string;
  avatar_url: string;
  phone: string;
  average_rating: number;
  total_completed: number;
};

export type ProviderLocation = {
  lat: number;
  lon: number;
  bearing: number;
  eta: number;
  timestamp: number;
};

export type BookingDraft = {
  service_id: string;
  service_title: string;
  category: string;
  latitude: number;
  longitude: number;
  formatted_address: string;
  problem_description: string;
  attachment_urls: string[];
  scheduled_at: string | null;
};

type BookingState = {
  // Draft being composed
  draft: BookingDraft | null;

  // Active booking tracking
  activeBookingId: string | null;
  activeStatus: BookingStatus | null;
  otpCode: string | null;
  provider: ProviderInfo | null;
  providerLocation: ProviderLocation | null;
  totalAmount: number;

  // Actions
  setDraft: (draft: BookingDraft) => void;
  clearDraft: () => void;
  setActiveBooking: (bookingId: string, status: BookingStatus) => void;
  updateStatus: (status: BookingStatus) => void;
  setProvider: (provider: ProviderInfo) => void;
  setProviderLocation: (location: ProviderLocation) => void;
  setOtpCode: (code: string) => void;
  setTotalAmount: (amount: number) => void;
  clearActiveBooking: () => void;
};

export const useBookingStore = create<BookingState>((set) => ({
  draft: null,
  activeBookingId: null,
  activeStatus: null,
  otpCode: null,
  provider: null,
  providerLocation: null,
  totalAmount: 0,

  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),

  setActiveBooking: (bookingId, status) =>
    set({ activeBookingId: bookingId, activeStatus: status }),

  updateStatus: (status) => set({ activeStatus: status }),

  setProvider: (provider) => set({ provider }),

  setProviderLocation: (location) => set({ providerLocation: location }),

  setOtpCode: (code) => set({ otpCode: code }),

  setTotalAmount: (amount) => set({ totalAmount: amount }),

  clearActiveBooking: () =>
    set({
      activeBookingId: null,
      activeStatus: null,
      otpCode: null,
      provider: null,
      providerLocation: null,
      totalAmount: 0,
    }),
}));
