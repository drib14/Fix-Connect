import api from './api';

export const getWorkers = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.specialty) params.append('specialty', filters.specialty);
  if (filters.maxDistance) params.append('maxDistance', filters.maxDistance);
  if (filters.lat) params.append('lat', filters.lat);
  if (filters.lon) params.append('lon', filters.lon);
  if (filters.search) params.append('search', filters.search);

  const response = await api.get(`/users/workers?${params.toString()}`);
  return response.data.workers;
};

export const geocodeAddress = async (q) => {
  const response = await api.get(`/users/geocode?q=${encodeURIComponent(q)}`);
  return response.data.results;
};
