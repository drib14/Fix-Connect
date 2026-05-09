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
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: "Too many requests, try again later."
});
app.use('/api', limiter);

/* ---------------- CORS (FIXED PROPERLY) ---------------- */
const corsOptions = {
    origin: "http://localhost:8081",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

app.use(cors(corsOptions));

/* ✅ FIX: handle preflight correctly (NO "*") */
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:8081");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

/* ---------------- BODY PARSER ---------------- */
app.use(express.json());

/* ---------------- ROUTES ---------------- */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

/* ---------------- SERVER ---------------- */
const server = http.createServer(app);
socketModule.init(server);

/* ---------------- START ---------------- */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});