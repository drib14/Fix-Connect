require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { clerkMiddleware } = require('@clerk/express');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Validate essential environment variables
if (!process.env.MONGO_URI) {
  console.error('CRITICAL ERROR: MONGO_URI is not defined in environment variables.');
  process.exit(1);
}
if (!process.env.CLERK_SECRET_KEY) {
  console.error('WARNING: CLERK_SECRET_KEY is not defined. Authentication features might fail.');
}

// Middleware
app.use(cors()); // Allow all cross-origins for mobile client development
app.use(morgan('dev'));
app.use(express.json());
app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
  debug: true
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

// Root / Health check route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'FixConnect Backend API is active and running.',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`FixConnect server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
