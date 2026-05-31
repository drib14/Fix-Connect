const rateLimit = require('express-rate-limit');

/**
 * Global API rate limiter
 * 100 requests per 15 minutes per IP
 */
exports.globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

/**
 * Strict auth rate limiter for login, register, forgot-password
 * 5 attempts per 15 minutes per IP
 */
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

/**
 * Payment rate limiter
 * 10 checkout attempts per 15 minutes per IP
 */
exports.paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many payment attempts. Please try again after 15 minutes.',
  },
});
