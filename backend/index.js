require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const http = require('http');

const connectDB = require('./config/db');
const socketModule = require('./socket');

connectDB();

const app = express();

/* ---------------- TRUST PROXY ---------------- */
app.set('trust proxy', 1);

/* ---------------- SECURITY MIDDLEWARE ---------------- */
app.use(helmet());
app.use(xss());

/* ---------------- RATE LIMIT ---------------- */
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: "Too many requests, try again later."
});
app.use('/api', limiter);

/* ---------------- CORS CONFIG ---------------- */
const allowedOrigins = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:19006"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Blocked by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// Handle preflight requests
app.options("*", cors());

/* ---------------- BODY PARSER ---------------- */
app.use(express.json());

/* ---------------- ROUTES ---------------- */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

/* ---------------- SERVER + SOCKET ---------------- */
const server = http.createServer(app);
socketModule.init(server);

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});