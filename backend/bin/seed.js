import '../config/env.js';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Category } from '../models/Category.js';
import { User } from '../models/User.js';
import { WorkerProfile } from '../models/WorkerProfile.js';
import bcrypt from 'bcryptjs';

const mockCategories = [
  {
    name: 'Plumbing Solutions',
    slug: 'plumbing',
    description: 'Expert leak repairs, fixture installations, and main pipe maintenance services.',
    iconName: 'Wrench',
  },
  {
    name: 'Electrical Engineering',
    slug: 'electrical',
    description: 'Bespoke wiring layouts, circuit upgrades, and smart home panel integrations.',
    iconName: 'Zap',
  },
  {
    name: 'Home Cleaning Services',
    slug: 'cleaning',
    description: 'Deep sanitary disinfection, standard housekeeping, and post-construction cleanups.',
    iconName: 'Brush',
  },
  {
    name: 'General Handyman',
    slug: 'handyman',
    description: 'Drywall patching, furniture assembly, hanging installations, and multi-trade solutions.',
    iconName: 'Sparkles',
  },
];

const seedDatabase = async () => {
  try {
    console.log('Starting FixConnect Database Seeding...\n');
    await connectDB();

    // 1. Seed Categories
    console.log('[1] Seeding Service Categories...');
    await Category.deleteMany({});
    const createdCategories = await Category.insertMany(mockCategories);
    console.log(`✅ Seeded ${createdCategories.length} category entries.\n`);

    // 2. Seed Mock Verified Service Providers
    console.log('[2] Seeding Mock Providers & Accounts...');
    // Clean old mock providers
    await User.deleteMany({ email: /@mockprovider\.com$/ });
    
    const salt = await bcrypt.genSalt(10);
    const mockPasswordHash = await bcrypt.hash('providerPassword123', salt);

    const mockProviders = [
      {
        name: 'Robert Vance',
        email: 'robert@mockprovider.com',
        role: 'provider',
        isVerified: true,
        isOnboarded: true,
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=60',
        profile: {
          businessName: 'Vance Plumbing Co.',
          specialty: 'Master Plumber',
          hourlyRate: 85,
          bio: 'Licensed master plumber with over 12 years of experience handling leak detection, pipeline remodeling, and emergency system diagnostics.',
          rating: 4.9,
          reviewsCount: 48,
          serviceRadius: 20,
          availability: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            startTime: '08:00',
            endTime: '17:00',
          },
        },
      },
      {
        name: 'Marcus Sterling',
        email: 'marcus@mockprovider.com',
        role: 'provider',
        isVerified: true,
        isOnboarded: true,
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=60',
        profile: {
          businessName: 'Sterling Electrical Systems',
          specialty: 'High-Voltage Electrician',
          hourlyRate: 95,
          bio: 'Certified industrial and residential electrician. Specializing in smart panel replacements, EV charger mounts, and strict safety audits.',
          rating: 4.8,
          reviewsCount: 36,
          serviceRadius: 15,
          availability: {
            days: ['Monday', 'Wednesday', 'Friday'],
            startTime: '09:00',
            endTime: '18:00',
          },
        },
      },
      {
        name: 'Clara Oswald',
        email: 'clara@mockprovider.com',
        role: 'provider',
        isVerified: true,
        isOnboarded: true,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60',
        profile: {
          businessName: 'Oswald Sparkling Cleans',
          specialty: 'Professional Home Cleaner',
          hourlyRate: 45,
          bio: 'Detail-oriented sanitation professional. Offering full-home deep disinfection, organic window care, and flexible weekly packages.',
          rating: 5.0,
          reviewsCount: 52,
          serviceRadius: 25,
          availability: {
            days: ['Tuesday', 'Thursday', 'Saturday'],
            startTime: '07:30',
            endTime: '16:00',
          },
        },
      },
    ];

    for (const item of mockProviders) {
      const user = new User({
        name: item.name,
        email: item.email,
        passwordHash: mockPasswordHash,
        role: item.role,
        isVerified: item.isVerified,
        isOnboarded: item.isOnboarded,
        avatar: item.avatar,
      });

      const savedUser = await user.save();

      // Clear any profile linked to this user ID
      await WorkerProfile.deleteOne({ userId: savedUser._id });

      const profile = new WorkerProfile({
        userId: savedUser._id,
        businessName: item.profile.businessName,
        specialty: item.profile.specialty,
        hourlyRate: item.profile.hourlyRate,
        bio: item.profile.bio,
        rating: item.profile.rating,
        reviewsCount: item.profile.reviewsCount,
        serviceRadius: item.profile.serviceRadius,
        availability: item.profile.availability,
      });

      await profile.save();
      console.log(`   - Created verified provider: ${savedUser.name} (${item.profile.businessName})`);
    }

    console.log('\n🎉 DATABASE SEEDING COMPLETED COMPREHENSIVELY! 🎉');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ SEEDING FAILED WITH ERROR:\n', err);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
