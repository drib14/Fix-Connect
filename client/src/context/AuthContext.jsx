import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('accessToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for force-logout event from api interceptor
    const handleLogoutEvent = () => {
      setUser(null);
    };
    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => window.removeEventListener('auth-logout', handleLogoutEvent);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/admin/login', { email, password });
      const { user: loggedUser, accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, phoneNumber, password, role) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        fullName,
        email,
        phoneNumber,
        password,
        role,
      });
      const { user: registeredUser, accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(registeredUser);
      return registeredUser;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
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
      console.error('Failed to refresh user data', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        onboard,
        refreshUserData,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
