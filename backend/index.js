require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');

const connectDB = require('./config/db');
const socketModule = require('./socket');

connectDB();

const app = express();

/* ---------------- TRUST PROXY ---------------- */
app.set('trust proxy', 1);

/* ---------------- SECURITY ---------------- */
app.use(helmet());

/* ---------------- RATE LIMIT ---------------- */
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: "Too many requests, please try again later."
});
app.use('/api', limiter);

/* ---------------- BODY PARSER ---------------- */
app.use(express.json());

/* ---------------- CORS CONFIG ---------------- */
const corsOptions = {
    origin: "http://localhost:8081",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

app.use(cors(corsOptions));

/* ---------------- FIXED PREFLIGHT HANDLING ---------------- */
app.options(/.*/, cors(corsOptions)); // ✅ FIXED (NO "*")

/* ---------------- ROUTES ---------------- */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

/* ---------------- SERVER ---------------- */
const server = http.createServer(app);
socketModule.init(server);

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});