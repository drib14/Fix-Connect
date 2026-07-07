const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Nodemon reload trigger: force database auto-seeding logic on server restart (update 3)
const localEnv = path.resolve(__dirname, '.env');
const parentEnv = path.resolve(__dirname, '../.env');
let loadedEnvPath = '';

if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv });
  loadedEnvPath = localEnv;
} else if (fs.existsSync(parentEnv)) {
  dotenv.config({ path: parentEnv });
  loadedEnvPath = parentEnv;
}



const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');
const { initBookingSocket } = require('./src/sockets/bookingSocket');
const errorHandler = require('./src/middleware/error');

// Route imports
const authRoutes = require('./src/routes/auth');
const serviceRoutes = require('./src/routes/services');
const bookingRoutes = require('./src/routes/bookings');
const paymentRoutes = require('./src/routes/payments');
const locationRoutes = require('./src/routes/location');
const promoRoutes = require('./src/routes/promos');
const supportRoutes = require('./src/routes/support');
const notificationRoutes = require('./src/routes/notifications');
const messageRoutes = require('./src/routes/messages');

const app = express();
const server = http.createServer(app);

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use('/api/', limiter); // Apply rate limiter to API routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', async (req, res, next) => {
  try {
    const Service = require('./src/models/Service');
    const totalCount = await Service.countDocuments({});
    const activeCount = await Service.countDocuments({ is_active: true });
    res.json({ 
      status: 'ok', 
      totalServices: totalCount, 
      activeServices: activeCount, 
      platform: 'FixConnect', 
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    next(err);
  }
});

// Global Error Handler
app.use(errorHandler);

// Initialize Socket.io namespaces
initBookingSocket(io);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server Running on PORT ${PORT}`);
  });
}).catch((err) => {
  process.exit(1);
});
