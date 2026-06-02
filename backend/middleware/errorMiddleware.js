import { logger } from '../utils/logger.js';

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Global Express Error Middleware
export const globalErrorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  // Custom Mongoose & MongoDB Error Handlers
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier format';
  } else if (err.code === 11000) {
    statusCode = 400;
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    message = `Duplicate field value: '${field}'. Please use another value!`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again!';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again!';
  }

  // Log Error based on category
  if (statusCode >= 500) {
    logger.error(`Critical Server Error: ${message}`, err);
  } else {
    logger.warn(`Operational HTTP ${statusCode} Warning: ${message}`);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
