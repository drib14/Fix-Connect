import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";
import {
  setSecureItem,
  getSecureItem,
  deleteSecureItem,
} from "../services/storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore stored session on startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await getSecureItem("token");
        if (storedToken) {
          setToken(storedToken);
          const res = await api.get("/auth/me");
          if (res.data.success) {
            setUser(res.data.user);
            setIsOnline(res.data.user.isOnline || false);
          }
        }
      } catch (err) {
        console.warn("Session restore failed:", err.message);
        await deleteSecureItem("token");
        await deleteSecureItem("refreshToken");
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data.success) {
      const {
        token: newToken,
        refreshToken: newRefreshToken,
        user: userData,
      } = res.data;

      await setSecureItem("token", newToken);
      await setSecureItem("refreshToken", newRefreshToken);

      setToken(newToken);
      setUser(userData);
      setIsOnline(userData.isOnline || false);
      return userData;
    }
    throw new Error(res.data.message);
  };

  // Register handler
  const register = async (userData) => {
    const res = await api.post("/auth/register", userData);
    if (res.data.success) {
      const {
        token: newToken,
        refreshToken: newRefreshToken,
        user: newUser,
      } = res.data;

      await setSecureItem("token", newToken);
      await setSecureItem("refreshToken", newRefreshToken);

      setToken(newToken);
      setUser(newUser);
      setIsOnline(newUser.isOnline || false);
      return newUser;
    }
    throw new Error(res.data.message);
  };

  // Customer Onboarding handler
  const onboardCustomer = async (data) => {
    const res = await api.post("/auth/onboard/customer", data);
    if (res.data.success) {
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.data.message || "Customer onboarding failed");
  };

  // Provider Onboarding handler
  const onboardProvider = async (data) => {
    const res = await api.post("/auth/onboard/provider", data);
    if (res.data.success) {
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.data.message || "Provider onboarding failed");
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Server logout failed:", err.message);
    }

    await deleteSecureItem("token");
    await deleteSecureItem("refreshToken");
    setToken(null);
    setUser(null);
    setIsOnline(false);
  };

  // Provider toggle online/offline availability
  const toggleOnlineStatus = async (coordinates) => {
    try {
      const res = await api.put("/auth/toggle-online", {
        isOnline: !isOnline,
        coordinates,
      });
      if (res.data.success) {
        setIsOnline(res.data.isOnline);
        setUser((prev) => ({
          ...prev,
          isOnline: res.data.isOnline,
        }));
        return res.data.isOnline;
      }
    } catch (err) {
      console.error("Toggle online error:", err.message);
    }
  };

  const activeRole = user?.role || "customer";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeRole,
        isOnline,
        isLoading,
        login,
        register,
        onboardCustomer,
        onboardProvider,
        logout,
        toggleOnlineStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
