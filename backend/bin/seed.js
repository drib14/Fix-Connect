import '../config/env.js';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Category } from '../models/Category.js';
import { User } from '../models/User.js';
import { WorkerProfile } from '../models/WorkerProfile.js';

const seedDatabase = async () => {
  try {
    console.log('Starting FixConnect Database Seeding...\n');
    await connectDB();

    console.log('[1] Clearing Database...');
    await Category.deleteMany({});
    await User.deleteMany({ email: /@mockprovider\.com$/ });
    await WorkerProfile.deleteMany({});

    console.log('\n🎉 DATABASE CLEARED (No data seeded as requested) 🎉');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ SEEDING FAILED WITH ERROR:\n', err);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
