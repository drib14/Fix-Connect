const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const dotenv = require("dotenv");

// Load environment variables from parent root directory .env or local
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

const connectDB = require("./config/db.js");
const { initSocket } = require("./services/socketService.js");
const { apiLimiter } = require("./middleware/securityMiddleware.js");

const authRoutes = require("./routes/authRoutes.js");
const serviceRoutes = require("./routes/serviceRoutes.js");
const bookingRoutes = require("./routes/bookingRoutes.js");

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO Server
initSocket(server);

// Connect Database
connectDB();

// ── Security Middleware Stack ──────────────────────────────────────────

// Secure HTTP headers with hardened Helmet configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow mobile clients
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS — restrict to known origins in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["*"];
app.use(
  cors({
    origin: allowedOrigins.includes("*") ? true : allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // Preflight cache: 24 hours
  })
);

// Body parsing with strict payload limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// Prevent NoSQL query operator injection ($gt, $ne, $or attacks)
app.use(
  mongoSanitize({
    replaceWith: "_",
    onSanitize: ({ req, key }) => {
      console.warn(`[Sanitize] Blocked NoSQL injection attempt on key: ${key}`);
    },
  })
);

// Apply global API rate limiter
app.use("/api", apiLimiter);

// Disable X-Powered-By (defense-in-depth, also covered by Helmet)
app.disable("x-powered-by");

// ── API Routes ────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);

// Health Check Endpoint (does not leak server internals)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "Healthy",
    service: "Fix-Connect",
  });
});

// Global 404 Handler — do NOT reflect user input to prevent XSS
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "The requested resource was not found",
  });
});

// Global Error Handler — suppress stack traces in production
app.use((err, req, res, next) => {
  console.error("[Unhandled Error]:", err.stack);

  const statusCode = err.status || 500;
  const isProduction = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    success: false,
    message: isProduction ? "Internal Server Error" : err.message,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[Fix-Connect Backend Running]: http://localhost:${PORT}`);
  console.log(`[Environment]: ${process.env.NODE_ENV || "development"}`);
});
