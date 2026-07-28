const rateLimit = require("express-rate-limit");

// Strict Rate Limiting for Authentication (Prevent Brute Force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login/registration attempts from this IP. Please try again after 15 minutes.",
  },
});

// General API Rate Limiting (Prevent DoS)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Max 200 requests per IP per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Global rate limit exceeded. Please slow down your requests.",
  },
});

// Dispatch Rate Limiter for instant service booking creation
const dispatchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Max 5 instant dispatch requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "You are requesting service bookings too rapidly. Please wait a minute.",
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
  dispatchLimiter,
};
