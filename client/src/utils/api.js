import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('CRITICAL ERROR: EXPO_PUBLIC_API_URL environment variable is missing.');
}

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
