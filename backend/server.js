require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const { globalLimiter } = require('./middleware/rateLimiter');

// Initialize app
const app = express();

// Connect Database
connectDB();

// ─── Security Middleware ──────────────────────────────────────────────
// HTTP security headers (XSS, sniffing, frameguard, HSTS)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Disable CSP for development flexibility
}));

// CORS: whitelist known frontend origins only
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser with size limit to prevent large payload attacks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize request data against NoSQL injection ($gt, $ne, etc.)
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`[Security] Sanitized NoSQL injection attempt on key: ${key}`);
  },
}));

// Prevent HTTP parameter pollution
app.use(hpp());

// Global rate limiter: 100 requests per 15 minutes per IP
app.use('/api', globalLimiter);

// ─── Seeding Script ───────────────────────────────────────────────────
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
        password: process.env.ADMIN_DEFAULT_PASSWORD || 'AdminPassword123',
        role: 'admin',
        isVerified: true,
        onboardingCompleted: true,
        phone: '+639123456789',
        address: 'FixConnect Hub, Bonifacio Global City, Manila, Philippines',
        location: {
          type: 'Point',
          coordinates: [121.0494, 14.5486],
        },
      });
      console.log('FixConnect Seeder: Admin account seeded.');
    }
  } catch (error) {
    console.error(`FixConnect Seeder Error: ${error.message}`);
  }
};

// Execute seeding
seedData();

// ─── API Routes ───────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/workers', require('./routes/worker'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payment'));

// System routes (if exists)
try {
  app.use('/api/system', require('./routes/system'));
} catch (e) {
  // system routes not yet implemented — skip silently
}

// Public categories endpoint
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort('name');
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Root Endpoint
app.get('/', (req, res) => {
  res.send('FixConnect API is running smoothly.');
});

// ─── Global Error Handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`FixConnect server running securely on port ${PORT}`);
});
