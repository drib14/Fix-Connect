const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

let io;

// Per-socket event rate limiting
const socketRateLimits = new Map();
const RATE_LIMIT_WINDOW_MS = 1000; // 1 second
const RATE_LIMIT_MAX_EVENTS = 10; // max events per second per socket

const checkSocketRateLimit = (socketId) => {
  const now = Date.now();
  const record = socketRateLimits.get(socketId);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    socketRateLimits.set(socketId, { windowStart: now, count: 1 });
    return true;
  }

  record.count += 1;
  if (record.count > RATE_LIMIT_MAX_EVENTS) {
    return false; // Rate limited
  }
  return true;
};

const initSocket = (server) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["*"];

  io = socketIO(server, {
    cors: {
      origin: allowedOrigins.includes("*") ? true : allowedOrigins,
      methods: ["GET", "POST", "PUT"],
    },
    // Limit payload size to prevent memory abuse
    maxHttpBufferSize: 1e5, // 100 KB
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  // JWT Middleware: REJECT unauthenticated connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error("Authentication required: No token provided"));
    }

    try {
      const secret = process.env.ACCESS_TOKEN_SECRET;
      if (!secret) {
        return next(new Error("Server configuration error"));
      }

      const decoded = jwt.verify(token, secret, {
        algorithms: ["HS256"],
      });

      if (!decoded.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
        return next(new Error("Authentication failed: Invalid token payload"));
      }

      socket.userId = decoded.id;
      return next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new Error("Token expired"));
      }
      return next(new Error("Authentication failed: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `[Socket Connected]: ${socket.id} (User: ${socket.userId})`
    );

    // Auto-join user's private notification room
    socket.join(`user_${socket.userId}`);

    // Join Specific Booking Room for tracking updates (with validation)
    socket.on("join_booking_room", (bookingId) => {
      if (!checkSocketRateLimit(socket.id)) return;

      // Validate bookingId format
      if (
        !bookingId ||
        typeof bookingId !== "string" ||
        !mongoose.Types.ObjectId.isValid(bookingId)
      ) {
        return;
      }

      socket.join(`booking_${bookingId}`);
    });

    // Provider joins category channel to receive incoming job dispatches
    socket.on("join_category_channel", (categorySlug) => {
      if (!checkSocketRateLimit(socket.id)) return;

      if (
        !categorySlug ||
        typeof categorySlug !== "string" ||
        categorySlug.length > 50
      ) {
        return;
      }

      // Sanitize: only allow alphanumeric and hyphens
      const sanitized = categorySlug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "");
      if (!sanitized) return;

      socket.join(`category_${sanitized}`);
    });

    // Provider updates live GPS coordinates (with rate limiting)
    socket.on("update_live_location", (data) => {
      if (!checkSocketRateLimit(socket.id)) return;

      if (!data || typeof data !== "object") return;

      const { bookingId, coordinates } = data;

      // Validate bookingId
      if (
        !bookingId ||
        typeof bookingId !== "string" ||
        !mongoose.Types.ObjectId.isValid(bookingId)
      ) {
        return;
      }

      // Validate coordinates
      if (
        !Array.isArray(coordinates) ||
        coordinates.length !== 2 ||
        typeof coordinates[0] !== "number" ||
        typeof coordinates[1] !== "number" ||
        coordinates[0] < -180 ||
        coordinates[0] > 180 ||
        coordinates[1] < -90 ||
        coordinates[1] > 90
      ) {
        return;
      }

      // Only emit to that booking room (not globally)
      io.to(`booking_${bookingId}`).emit("provider_location_changed", {
        coordinates,
        updatedAt: new Date(),
      });
    });

    socket.on("disconnect", () => {
      socketRateLimits.delete(socket.id); // Cleanup
      console.log(`[Socket Disconnected]: ${socket.id}`);
    });
  });

  // Periodic cleanup of stale rate-limit records
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of socketRateLimits) {
      if (now - record.windowStart > RATE_LIMIT_WINDOW_MS * 10) {
        socketRateLimits.delete(key);
      }
    }
  }, 30000);

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };
