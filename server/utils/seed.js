const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB database to seed...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB. Clearing existing collections...');

    // Clear existing data
    await User.deleteMany({ clerkId: { $ne: null } });
    await Service.deleteMany({});
    await Booking.deleteMany({});

    console.log('Collections cleared. Inserting mock workers...');

    // Create 4 mock workers
    const workers = [
      {
        clerkId: 'user_worker_alex',
        email: 'alex.plumber@fixconnect.com',
        name: 'Alex Rivera',
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
        phone: '+1 555-0199',
        role: 'worker',
        status: 'online',
        location: {
          type: 'Point',
          coordinates: [120.9842, 14.5995] // Manila
        },
        workerDetails: {
          bio: 'Professional plumber with over 8 years of experience. Certified in leakage repair, pipes installation, and emergency clogging issues.',
          skills: ['Leak Detection', 'Pipe Installation', 'Clogging Repair', 'Bathroom Fitting'],
          category: 'Plumbing',
          rating: 4.8,
          ratingsCount: 24
        }
      },
      {
        clerkId: 'user_worker_sarah',
        email: 'sarah.spark@fixconnect.com',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        phone: '+1 555-0188',
        role: 'worker',
        status: 'online',
        location: {
          type: 'Point',
          coordinates: [120.9762, 14.5825] // Intramuros
        },
        workerDetails: {
          bio: 'Licensed residential electrician. Specializing in home re-wiring, socket replacement, fan/light installations, and safety inspections.',
          skills: ['Home Re-wiring', 'Light Installation', 'Circuit Breaker Fixes', 'Safety Auditing'],
          category: 'Electrical',
          rating: 4.9,
          ratingsCount: 38
        }
      },
      {
        clerkId: 'user_worker_marcus',
        email: 'marcus.clean@fixconnect.com',
        name: 'Marcus Brody',
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
        phone: '+1 555-0177',
        role: 'worker',
        status: 'online',
        location: {
          type: 'Point',
          coordinates: [120.9902, 14.6125] // Sampaloc
        },
        workerDetails: {
          bio: 'Home disinfection and deep cleaning specialist. Providing detail-oriented eco-friendly cleaning services for apartments and houses.',
          skills: ['Deep Cleaning', 'Sanitization', 'Carpet Cleaning', 'Post-Event Cleanup'],
          category: 'Cleaning',
          rating: 4.7,
          ratingsCount: 15
        }
      },
      {
        clerkId: 'user_worker_elena',
        email: 'elena.ac@fixconnect.com',
        name: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        phone: '+1 555-0166',
        role: 'worker',
        status: 'online',
        location: {
          type: 'Point',
          coordinates: [121.0125, 14.5547] // Makati
        },
        workerDetails: {
          bio: 'AC technician with expertise in split type and window air conditioner servicing, cleaning, refrigerant refilling, and motherboard repair.',
          skills: ['AC Cleaning', 'Gas Recharge', 'Compressor Repair', 'System Diagnostics'],
          category: 'AC Repair',
          rating: 4.6,
          ratingsCount: 19
        }
      }
    ];

    const savedWorkers = await User.insertMany(workers);
    console.log(`Saved ${savedWorkers.length} mock workers successfully.`);

    // Services definition matching mock workers
    const services = [
      {
        name: 'Emergency Pipe Leakage Repair',
        category: 'Plumbing',
        description: 'Complete diagnostic and sealing of leaking pipes behind walls, under sinks, or within bathroom systems.',
        price: 45,
        duration: '1.5 hours',
        worker: savedWorkers[0]._id
      },
      {
        name: 'Drain Unclogging Service',
        category: 'Plumbing',
        description: 'High-pressure unclogging of kitchen sinks, bathroom drains, and toilet systems including hair and fat removal.',
        price: 35,
        duration: '1 hour',
        worker: savedWorkers[0]._id
      },
      {
        name: 'Ceiling Fan and Light Installation',
        category: 'Electrical',
        description: 'Professional assembly and wiring installation for ceiling lights, fans, chandeliers, or smart switches.',
        price: 30,
        duration: '1 hour',
        worker: savedWorkers[1]._id
      },
      {
        name: 'Complete Circuit Breaker Upgrade',
        category: 'Electrical',
        description: 'Upgrading old circuit breakers to handle high-appliance loads safely. Includes 1-year guarantee on parts.',
        price: 150,
        duration: '3 hours',
        worker: savedWorkers[1]._id
      },
      {
        name: 'Full Home Deep Disinfection',
        category: 'Cleaning',
        description: 'Deep sanitation of all surfaces, bedrooms, bathrooms, and kitchen area using professional-grade, eco-friendly agents.',
        price: 80,
        duration: '4 hours',
        worker: savedWorkers[2]._id
      },
      {
        name: 'Standard Carpet Vacuum & Cleaning',
        category: 'Cleaning',
        description: 'Hot-water extraction carpet cleaning to remove dirt, allergens, and light stains from living room carpets.',
        price: 40,
        duration: '1.5 hours',
        worker: savedWorkers[2]._id
      },
      {
        name: 'AC Filter & Deep Coil Cleaning',
        category: 'AC Repair',
        description: 'Chemical coil wash and clean of filters to improve cooling efficiency, airflow, and air quality.',
        price: 25,
        duration: '1 hour',
        worker: savedWorkers[3]._id
      },
      {
        name: 'AC Compressor Motherboard Repair',
        category: 'AC Repair',
        description: 'Replacing or repairing faulty PCBs, relays, and starters inside split or window air conditioner compressors.',
        price: 95,
        duration: '2.5 hours',
        worker: savedWorkers[3]._id
      }
    ];

    const savedServices = await Service.insertMany(services);
    console.log(`Saved ${savedServices.length} mock services successfully.`);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
