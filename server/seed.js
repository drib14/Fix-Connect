require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Worker = require('./models/Worker');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Clear mock data
    await Worker.deleteMany({});
    console.log('Cleared mock workers.');

    // Kept users so we can still test logging in
    console.log('Seed reset complete!');
    process.exit();
  })
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
