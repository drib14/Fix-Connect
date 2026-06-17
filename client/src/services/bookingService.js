import api from './api';

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data.booking;
};

export const getBookings = async () => {
  const response = await api.get('/bookings');
  return response.data.bookings;
};

export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data.booking;
};

export const updateBookingStatus = async (id, status) => {
  const response = await api.patch(`/bookings/${id}/status`, { status });
  return response.data.booking;
};

export const sendChatMessage = async (id, text) => {
  const response = await api.post(`/bookings/${id}/chat`, { text });
  return response.data.chat;
};

export const createReview = async (id, rating, comment) => {
  const response = await api.post(`/bookings/${id}/review`, { rating, comment });
  return response.data.booking;
};
