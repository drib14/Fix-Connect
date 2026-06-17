import React, { createContext, useContext, useState } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/worker/login', { email, password });
      const { user: loggedUser, accessToken } = response.data;
      setAuthToken(accessToken);
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, phoneNumber, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/worker/register', {
        fullName,
        email,
        phoneNumber,
        password,
      });
      const { user: registeredUser, accessToken } = response.data;
      setAuthToken(accessToken);
      setUser(registeredUser);
      return registeredUser;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const onboard = async (onboardData) => {
    try {
      const response = await api.post('/users/onboard', onboardData);
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      throw error.response?.data?.message || 'Onboarding failed';
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.log('Refresh error', error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, onboard, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
