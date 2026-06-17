import axios from 'axios';
import { Platform } from 'react-native';

// Adjust this IP to your computer's local network IP for testing on physical devices.
// 10.0.2.2 is the loopback interface to your host machine in standard Android Emulators.
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_BASE = `http://${DEV_HOST}:5000/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Use memory/mock token storage for React Native (can be swapped for AsyncStorage / SecureStore)
let _accessToken = null;

export const setAuthToken = (token) => {
  _accessToken = token;
};

api.interceptors.request.use(
  async (config) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
export { API_BASE };
