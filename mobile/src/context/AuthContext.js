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
  const [activeRole, setActiveRole] = useState("customer");
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
            setActiveRole(
              res.data.user.activeRole || res.data.user.role
            );
            setIsOnline(res.data.user.isOnline || false);
          }
        }
      } catch (err) {
        console.warn("Session restore failed:", err.message);
        // The API interceptor will try refresh automatically;
        // if that also fails, it clears tokens. Clean up local state.
        await deleteSecureItem("token");
        await deleteSecureItem("refreshToken");
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Login handler — store both access and refresh tokens securely
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
      setActiveRole(userData.activeRole || userData.role);
      setIsOnline(userData.isOnline || false);
      return userData;
    }
    throw new Error(res.data.message);
  };

  // Register handler — store both access and refresh tokens securely
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
      setActiveRole(newUser.activeRole || newUser.role);
      setIsOnline(newUser.isOnline || false);
      return newUser;
    }
    throw new Error(res.data.message);
  };

  // Logout handler — invalidate server-side session and clear local storage
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // Logout request may fail if token is already expired; ignore
      console.warn("Server logout failed:", err.message);
    }

    await deleteSecureItem("token");
    await deleteSecureItem("refreshToken");
    setToken(null);
    setUser(null);
    setIsOnline(false);
  };

  // Toggle mode (Customer <-> Provider)
  const switchRole = async () => {
    try {
      const res = await api.put("/auth/switch-role");
      if (res.data.success) {
        const newRole = res.data.activeRole;
        setActiveRole(newRole);
        setUser((prev) => ({ ...prev, activeRole: newRole }));
        // Force offline when switching to customer mode
        if (newRole === "customer") {
          setIsOnline(false);
        }
      }
    } catch (err) {
      console.error("Role switch error:", err.message);
    }
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
        logout,
        switchRole,
        toggleOnlineStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
