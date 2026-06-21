import axios from 'axios';

// Fallback to localhost if EXPO_PUBLIC_API_URL is missing
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getApiClient = (token) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return axios.create({
    baseURL: API_URL,
    headers,
    timeout: 10000 // 10 seconds timeout
  });
};
