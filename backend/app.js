import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { globalErrorHandler, AppError } from './middleware/errorMiddleware.js';
import { logger } from './utils/logger.js';

// Import Routers
import authRouter from './routes/authRoutes.js';
import workerRouter from './routes/workerRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import profileRouter from './routes/profileRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import notificationRouter from './routes/notificationRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import currencyRouter from './routes/currencyRoutes.js';
import platformRouter from './routes/platformRoutes.js';

const app = express();

// Security Headers
app.use(helmet({ crossOriginEmbedderPolicy: false }));

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Logging HTTP Requests
const morganStream = {
  write: (message) => logger.info(message.trim()),
};
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: morganStream }));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie Parser for JWT Refresh Token
app.use(cookieParser());

// Rate Limiting to prevent DDOS / Brute Force
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', apiLimiter);

// Health Check Route
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// ─────────────────────────────────────────────
// Mount Routes
// ─────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/chat', chatRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/currency', currencyRouter);
app.use('/api/platform', platformRouter);
app.use('/api', workerRouter); // categories & workers

// Fallback for Undefined Routes
app.all('*', (req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Central Error Handling Middleware
app.use(globalErrorHandler);

export default app;
