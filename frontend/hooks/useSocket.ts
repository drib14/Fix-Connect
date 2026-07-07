import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { useBookingStore } from '@/store/useBookingStore';

const SOCKET_URL = 'http://localhost:5000/bookings';

/**
 * Custom hook for Socket.io connection management.
 * Connects to the /bookings namespace with JWT auth.
 */
export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const {
    setProvider,
    setProviderLocation,
    updateStatus,
    setOtpCode,
    activeBookingId,
  } = useBookingStore();

  const connect = useCallback(async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('🔌 Socket connected');
    });

    socket.on('booking_accepted', ({ provider }) => {
      setProvider(provider);
      updateStatus('ACCEPTED');
    });

    socket.on('location_update', (data) => {
      setProviderLocation(data);
    });

    socket.on('status_change', ({ status, otp_code }) => {
      updateStatus(status);
      if (otp_code) {
        setOtpCode(otp_code);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('🔌 Socket error:', err.message);
    });

    socketRef.current = socket;
    return socket;
  }, []);

  const joinBooking = useCallback((bookingId: string) => {
    socketRef.current?.emit('join_booking', { bookingId });
  }, []);

  const sendMessage = useCallback((bookingId: string, message: string) => {
    socketRef.current?.emit('chat_message', { bookingId, message });
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    joinBooking,
    sendMessage,
  };
}
