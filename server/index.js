require('dotenv').config();  // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Your routes
const authRoutes = require('./routes/auth');
const workerRoutes = require('./routes/workers');
const statsRoutes = require('./routes/stats');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', process.env.FRONTEND_URL],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug: Log the Mongo URI to check if it's being loaded correctly
console.log('Mongo URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});