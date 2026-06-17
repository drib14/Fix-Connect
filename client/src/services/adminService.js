import api from './api';

export const getPendingWorkers = async () => {
  const response = await api.get('/admin/workers/pending');
  return response.data.pendingWorkers;
};

export const verifyWorker = async (id, action) => {
  const response = await api.patch(`/admin/workers/${id}/verify`, { action });
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data.users;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const updateUserStatus = async (id, status) => {
  const response = await api.patch(`/admin/users/${id}/status`, { status });
  return response.data.user;
};

export const getBookings = async () => {
  const response = await api.get('/admin/bookings');
  return response.data.bookings;
};

export const getBookingDetails = async (id) => {
  const response = await api.get(`/admin/bookings/${id}`);
  return response.data.booking;
};

export const updateBookingStatus = async (id, status) => {
  const response = await api.patch(`/admin/bookings/${id}/status`, { status });
  return response.data;
};

export const updateUserProfile = async (id, profileData) => {
  const response = await api.put(`/admin/users/${id}`, profileData);
  return response.data.user;
};

export const getPayments = async () => {
  const response = await api.get('/admin/payments');
  return response.data.transactions;
};

export const getReviews = async () => {
  const response = await api.get('/admin/reviews');
  return response.data.bookings;
};

export const deleteReview = async (bookingId) => {
  const response = await api.delete(`/admin/reviews/${bookingId}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/admin/categories');
  return response.data.categories;
};

export const createCategory = async (categoryData) => {
  const response = await api.post('/admin/categories', categoryData);
  return response.data.category;
};

export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/admin/categories/${id}`, categoryData);
  return response.data.category;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/admin/categories/${id}`);
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await api.get('/admin/audit-logs');
  return response.data.logs;
};
