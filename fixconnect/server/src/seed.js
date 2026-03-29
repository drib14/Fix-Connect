require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Worker = require('./models/Worker');

const mockWorkers = [
  {
    name: 'Juan Dela Cruz',
    category: 'Web Developer',
    description: 'Expert in MERN stack, 5 years experience.',
    imageUrl: 'https://i.pravatar.cc/150?u=juan',
    rating: 4.8,
  },
  {
    name: 'Maria Clara',
    category: 'Virtual Assistant',
    description: 'Highly organized VA specializing in data entry and scheduling.',
    imageUrl: 'https://i.pravatar.cc/150?u=maria',
    rating: 4.9,
  },
  {
    name: 'Pedro Penduko',
    category: 'Physical Worker',
    description: 'Skilled carpenter and all-around handyman.',
    imageUrl: 'https://i.pravatar.cc/150?u=pedro',
    rating: 4.5,
  },
  {
    name: 'Leonor Rivera',
    category: 'Graphic Designer',
    description: 'Creative designer specializing in UI/UX and branding.',
    imageUrl: 'https://i.pravatar.cc/150?u=leonor',
    rating: 4.7,
  },
  {
    name: 'Jose Rizal',
    category: 'Content Writer',
    description: 'Excellent writer with a knack for engaging articles.',
    imageUrl: 'https://i.pravatar.cc/150?u=jose',
    rating: 5.0,
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
