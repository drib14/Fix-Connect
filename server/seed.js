require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Worker = require('./models/Worker');
const ServicePost = require('./models/ServicePost');
const Booking = require('./models/Booking');
const Review = require('./models/Review');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Clear ALL data
    await User.deleteMany({});
    await Worker.deleteMany({});
    await ServicePost.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});

    console.log('Deleted all data: Users, Workers, ServicePosts, Bookings, and Reviews.');
    console.log('Database is completely wiped clean.');
    process.exit();
  })
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
