require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Worker = require('./models/Worker');

const mockWorkers = [
  {
    name: 'Juan Dela Cruz',
    category: 'Carpenter',
    description: 'Master carpenter with 10 years of experience in custom furniture and home repairs.',
    imageUrl: 'https://i.pravatar.cc/150?u=juan',
    rating: 4.8,
    jobsOffered: ['Custom Furniture', 'Cabinet Repair', 'Door Installation', 'General Carpentry'],
    baseFee: 1500,
    rateType: 'Daily'
  },
  {
    name: 'Maria Clara',
    category: 'Virtual Assistant',
    description: 'Highly organized VA specializing in data entry, scheduling, and admin tasks.',
    imageUrl: 'https://i.pravatar.cc/150?u=maria',
    rating: 4.9,
    jobsOffered: ['Calendar Management', 'Email Sorting', 'Data Entry', 'Customer Support'],
    baseFee: 25000,
    rateType: 'Monthly'
  },
  {
    name: 'Pedro Penduko',
    category: 'Plumber',
    description: 'Licensed plumber expert in pipe fitting, leak repairs, and drainage systems.',
    imageUrl: 'https://i.pravatar.cc/150?u=pedro',
    rating: 4.5,
    jobsOffered: ['Pipe Leak Repair', 'Toilet Installation', 'Drain Cleaning'],
    baseFee: 800,
    rateType: 'One-time'
  },
  {
    name: 'Mario Tubero',
    category: 'Electrician',
    description: 'Certified electrician for residential wiring and fixture installations.',
    imageUrl: 'https://i.pravatar.cc/150?u=mario',
    rating: 4.6,
    jobsOffered: ['Wiring & Rewiring', 'Lighting Installation', 'Circuit Breaker Repair'],
    baseFee: 1000,
    rateType: 'One-time'
  },
  {
    name: 'Leonor Rivera',
    category: 'House Cleaner',
    description: 'Meticulous house cleaner providing deep cleaning and organizing services.',
    imageUrl: 'https://i.pravatar.cc/150?u=leonor',
    rating: 4.7,
    jobsOffered: ['Deep Cleaning', 'Move-in/Move-out Cleaning', 'Organization'],
    baseFee: 1200,
    rateType: 'Daily'
  },
  {
    name: 'Jose Rizal',
    category: 'Web Developer',
    description: 'MERN stack expert building modern, responsive web applications.',
    imageUrl: 'https://i.pravatar.cc/150?u=jose',
    rating: 5.0,
    jobsOffered: ['Full Stack Development', 'E-commerce Sites', 'API Integration', 'UI/UX Implementation'],
    baseFee: 40000,
    rateType: 'Monthly'
  },
];

const mockUsers = [
  {
    email: 'user1@test.com',
    password: 'password123',
    location: { region: 'Region VII', province: 'Cebu', city: 'Cebu City' }
  },
  {
    email: 'user2@test.com',
    password: 'password123',
    location: { region: 'NCR', province: 'Metro Manila', city: 'Quezon City' }
  },
  {
    email: 'user3@test.com',
    password: 'password123',
    location: { region: 'Region XI', province: 'Davao del Sur', city: 'Davao City' }
  }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    await Worker.deleteMany({});
    await Worker.insertMany(mockWorkers);
    console.log('Workers seeded successfully!');

    // Only seed users if the db is empty to avoid duplicate email errors
    const userCount = await User.countDocuments();
    if(userCount === 0) {
      for (const user of mockUsers) {
        await User.create(user);
      }
      console.log('Users seeded successfully!');
    } else {
        console.log('Users already exist, skipping user seed.');
    }

    process.exit();
  })
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
