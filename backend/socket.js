import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from './utils/logger.js';
import { Message } from './models/Message.js';
import { Notification } from './models/Notification.js';

let io;

// Track online users: userId -> socketId
const onlineUsers = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Auth middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    logger.info(`Socket connected: userId=${userId} socketId=${socket.id}`);

    // Register user as online
    onlineUsers.set(userId, socket.id);
    socket.join(`user:${userId}`); // Personal room for notifications

    // Broadcast online status
    socket.broadcast.emit('user-online', { userId });

    // ───────────────────────────────────────────
    // BOOKING ROOMS
    // ───────────────────────────────────────────
    socket.on('join-booking', ({ bookingId }) => {
      socket.join(`booking:${bookingId}`);
      logger.info(`User ${userId} joined booking room: ${bookingId}`);
    });

    socket.on('leave-booking', ({ bookingId }) => {
      socket.leave(`booking:${bookingId}`);
    });

    // ───────────────────────────────────────────
    // REAL-TIME CHAT
    // ───────────────────────────────────────────
    socket.on('send-message', async ({ bookingId, receiverId, text }) => {
      try {
        const message = await Message.create({
          booking: bookingId,
          sender: userId,
          receiver: receiverId,
          text,
        });

        const populated = await message.populate('sender', 'name avatar role');

        // Broadcast to booking room
        io.to(`booking:${bookingId}`).emit('new-message', populated);

        // Notify receiver via personal room
        io.to(`user:${receiverId}`).emit('message-notification', {
          bookingId,
          senderName: populated.sender.name,
          preview: text.substring(0, 80),
        });
      } catch (err) {
        logger.error(`Socket send-message error: ${err.message}`);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ───────────────────────────────────────────
    // TYPING INDICATORS
    // ───────────────────────────────────────────
    socket.on('typing-start', ({ bookingId }) => {
      socket.to(`booking:${bookingId}`).emit('user-typing', { userId });
    });

    socket.on('typing-stop', ({ bookingId }) => {
      socket.to(`booking:${bookingId}`).emit('user-stopped-typing', { userId });
    });

    // ───────────────────────────────────────────
    // MARK MESSAGES READ
    // ───────────────────────────────────────────
    socket.on('messages-read', async ({ bookingId }) => {
      try {
        await Message.updateMany(
          { booking: bookingId, receiver: userId, isRead: false },
          { isRead: true, readAt: new Date() }
        );
        socket.to(`booking:${bookingId}`).emit('messages-seen', { bookingId, byUser: userId });
      } catch (err) {
        logger.error(`Socket messages-read error: ${err.message}`);
      }
    });

    // ───────────────────────────────────────────
    // DISCONNECT
    // ───────────────────────────────────────────
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit('user-offline', { userId });
      logger.info(`Socket disconnected: userId=${userId}`);
    });
  });

  logger.info('Socket.IO initialized');
  return io;
};

// Get the io instance
export const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

// Emit a notification to a specific user
export const emitNotification = async (userId, notificationData) => {
  try {
    const notification = await Notification.create({
      user: userId,
      ...notificationData,
    });
    if (io) {
      io.to(`user:${userId}`).emit('new-notification', notification);
    }
    return notification;
  } catch (err) {
    logger.error(`emitNotification error: ${err.message}`);
  }
};

// Emit booking status update
export const emitBookingUpdate = (bookingId, data) => {
  if (io) {
    io.to(`booking:${bookingId}`).emit('booking-updated', data);
  }
};

// Check if user is online
export const isUserOnline = (userId) => onlineUsers.has(String(userId));
