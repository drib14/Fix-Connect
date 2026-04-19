require('dotenv').config(); // Make sure dotenv is called at the top to load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const workerRoutes = require('./routes/workers');
const statsRoutes = require('./routes/stats');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const app = express();

// Debugging: Print out the MongoDB URI from environment variables to verify it's loaded
console.log("Mongo URI:", process.env.MONGO_URI);

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', process.env.FRONTEND_URL],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Check if the MONGO_URI is loaded from the environment variables correctly
if (!process.env.MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in .env file!');
  process.exit(1); // Exit the application if the MONGO_URI is not found
}

// Connect to MongoDB using mongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the application if the connection fails
  });

app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

// Set port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});