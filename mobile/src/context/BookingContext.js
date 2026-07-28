import React, { createContext, useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import { Platform } from "react-native";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

export const BookingContext = createContext();

const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ||
  (process.env.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL.replace(/\/api$/, "")
    : Platform.OS === "android"
    ? "http://10.0.2.2:5000"
    : "http://localhost:5000");

export const BookingProvider = ({ children }) => {
  const { token, user, activeRole, isOnline } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [incomingDispatch, setIncomingDispatch] = useState(null);
  const [services, setServices] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize Socket.IO connection when user token changes
  useEffect(() => {
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("[Mobile Socket Connected]");
    });

    // Listen for incoming job dispatch offers (Provider Mode)
    newSocket.on("new_job_dispatch", (data) => {
      if (activeRole === "provider" && isOnline && !activeBooking) {
        console.log("[Incoming Job Dispatch]:", data.booking.bookingCode);
        setIncomingDispatch(data.booking);
      }
    });

    newSocket.on("broadcast_job_dispatch", (data) => {
      if (activeRole === "provider" && isOnline && !activeBooking) {
        setIncomingDispatch(data.booking);
      }
    });

    // Listen for booking accepted / status changes
    newSocket.on("booking_accepted", (data) => {
      console.log("[Booking Accepted]:", data.booking);
      setActiveBooking(data.booking);
      setIsSearching(false);
      setIncomingDispatch(null);
    });

    newSocket.on("booking_status_updated", (data) => {
      console.log("[Status Updated]:", data.booking.status);
      setActiveBooking(data.booking);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, activeRole, isOnline]);

  // Fetch available services
  const fetchServices = async () => {
    try {
      const res = await api.get("/services");
      if (res.data.success) {
        setServices(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching services:", err.message);
    }
  };

  // Fetch booking history
  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings");
      if (res.data.success) {
        setBookingHistory(res.data.bookings);
        // Find active booking if any
        const active = res.data.bookings.find((b) =>
          ["SEARCHING", "ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"].includes(b.status)
        );
        if (active) {
          setActiveBooking(active);
          if (active.status === "SEARCHING") setIsSearching(true);
        }
      }
    } catch (err) {
      console.error("Error fetching bookings:", err.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchServices();
      fetchBookings();
    }
  }, [token]);

  // Create Instant Service Request
  const createInstantBooking = async (bookingData) => {
    try {
      setIsSearching(true);
      const res = await api.post("/bookings", bookingData);
      if (res.data.success) {
        setActiveBooking(res.data.booking);
        if (socket) {
          socket.emit("join_booking_room", res.data.booking._id);
        }
        return res.data.booking;
      }
    } catch (err) {
      setIsSearching(false);
      throw err;
    }
  };

  // Accept incoming job (Provider)
  const acceptJob = async (bookingId) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/accept`);
      if (res.data.success) {
        setActiveBooking(res.data.booking);
        setIncomingDispatch(null);
        if (socket) {
          socket.emit("join_booking_room", bookingId);
        }
        return res.data.booking;
      }
    } catch (err) {
      setIncomingDispatch(null);
      throw err;
    }
  };

  // Decline incoming job offer (Provider)
  const declineJob = () => {
    setIncomingDispatch(null);
  };

  // Update status (EN_ROUTE -> ARRIVED -> IN_PROGRESS -> COMPLETED)
  const updateJobStatus = async (bookingId, status) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status });
      if (res.data.success) {
        setActiveBooking(res.data.booking);
        if (status === "COMPLETED" || status === "CANCELLED") {
          setActiveBooking(null);
          setIsSearching(false);
        }
        fetchBookings();
        return res.data.booking;
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <BookingContext.Provider
      value={{
        services,
        activeBooking,
        incomingDispatch,
        isSearching,
        bookingHistory,
        createInstantBooking,
        acceptJob,
        declineJob,
        updateJobStatus,
        fetchBookings,
        setIsSearching,
        setActiveBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
