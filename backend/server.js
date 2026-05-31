require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');

// Initialize app
const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Seeding Script
const seedData = async () => {
  try {
    // 1. Seed Categories
    const categoriesCount = await Category.countDocuments();
    if (categoriesCount === 0) {
      await Category.create([
        {
          name: 'Plumbing',
          slug: 'plumbing',
          description: 'Leaky pipes, faucet repairs, water heaters, and drain cleaning.',
          icon: 'Wrench',
          basePrice: 45,
        },
        {
          name: 'Electrical',
          slug: 'electrical',
          description: 'Outlet installations, wiring repairs, light fixtures, and breaker boxes.',
          icon: 'Zap',
          basePrice: 50,
        },
        {
          name: 'Cleaning',
          slug: 'cleaning',
          description: 'Deep home cleaning, laundry, vacuuming, and kitchen sanitation.',
          icon: 'Sparkles',
          basePrice: 30,
        },
        {
          name: 'Appliance Repair',
          slug: 'appliance',
          description: 'Refrigerators, washing machines, microwaves, AC units, and TVs.',
          icon: 'Tv',
          basePrice: 40,
        },
        {
          name: 'Carpentry',
          slug: 'carpentry',
          description: 'Furniture assembly, cabinet repairs, door installation, and wood works.',
          icon: 'Hammer',
          basePrice: 48,
        },
        {
          name: 'Gardening',
          slug: 'gardening',
          description: 'Lawn mowing, plant pruning, landscape layout, and backyard cleaning.',
          icon: 'Leaf',
          basePrice: 25,
        },
      ]);
      console.log('FixConnect Seeder: Service categories populated.');
    }

    // 2. Seed Administrator Account
    const adminExists = await User.findOne({ email: 'admin@fixconnect.com' });
    if (!adminExists) {
      await User.create({
        name: 'FixConnect Admin',
        email: 'admin@fixconnect.com',
        password: 'AdminPassword123', // Automatically hashed by User model pre-save hook
        role: 'admin',
        isVerified: true,
        onboardingCompleted: true,
        phone: '+639123456789',
        address: 'FixConnect Hub, Bonifacio Global City, Manila, Philippines',
        location: {
          type: 'Point',
          coordinates: [121.0494, 14.5486], // Manila coords
        },
      });
      console.log('FixConnect Seeder: Admin account seeded (admin@fixconnect.com / AdminPassword123)');
    }
  } catch (error) {
    console.error(`FixConnect Seeder Error: ${error.message}`);
  }
};

// Execute seeding
seedData();

// Define API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/workers', require('./routes/worker'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payment'));

// Root Endpoint
app.get('/', (req, res) => {
  res.send('FixConnect API is running smoothly.');
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
