import api from './api';

export const createPaymentIntent = async (bookingId) => {
  const response = await api.post('/payments/create-intent', { bookingId });
  return response.data;
};

export const confirmPayment = async (bookingId, paymentMethod, paymentId) => {
  const response = await api.post('/payments/confirm', {
    bookingId,
    paymentMethod,
    paymentId,
  });
  return response.data;
};
