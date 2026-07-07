const mongoose = require('mongoose');
const Service = require('../models/Service');

const defaultServices = [
  {
    title: 'General House Cleaning',
    description: 'Full deep cleaning of your home including mopping, dusting, and sanitizing all rooms.',
    category: 'cleaning',
    icon_name: 'sparkles',
    base_rate: 500,
    rate_type: 'per_visit',
    estimated_duration: 120,
    is_active: true,
    tags: ['home', 'deep-clean', 'sanitize'],
  },
  {
    title: 'Kitchen Deep Clean',
    description: 'Thorough kitchen cleaning including appliance exteriors, countertops, and grease removal.',
    category: 'cleaning',
    icon_name: 'restaurant',
    base_rate: 350,
    rate_type: 'per_visit',
    estimated_duration: 90,
    is_active: true,
    tags: ['kitchen', 'grease', 'appliance'],
  },
  {
    title: 'Pipe Leak Repair',
    description: 'Diagnose and fix leaking pipes, faucets, and water connections throughout your home.',
    category: 'plumbing',
    icon_name: 'water',
    base_rate: 400,
    rate_type: 'fixed',
    estimated_duration: 60,
    is_active: true,
    tags: ['leak', 'pipe', 'faucet'],
  },
  {
    title: 'Drain Unclogging',
    description: 'Professional unclogging of kitchen sinks, bathroom drains, and floor drains.',
    category: 'plumbing',
    icon_name: 'funnel',
    base_rate: 300,
    rate_type: 'fixed',
    estimated_duration: 45,
    is_active: true,
    tags: ['clog', 'drain', 'sink'],
  },
  {
    title: 'Outlet & Switch Installation',
    description: 'Install or replace electrical outlets, switches, and wall plates safely.',
    category: 'electrical',
    icon_name: 'flash',
    base_rate: 300,
    rate_type: 'fixed',
    estimated_duration: 30,
    is_active: true,
    tags: ['outlet', 'switch', 'wiring'],
  },
  {
    title: 'Light Fixture Installation',
    description: 'Mount and wire ceiling lights, chandeliers, and wall-mounted lighting fixtures.',
    category: 'electrical',
    icon_name: 'bulb',
    base_rate: 400,
    rate_type: 'fixed',
    estimated_duration: 60,
    is_active: true,
    tags: ['lighting', 'chandelier', 'fixture'],
  },
  {
    title: 'Aircon Cleaning & Maintenance',
    description: 'Professional split-type or window AC cleaning, filter replacement, and freon check.',
    category: 'appliance_repair',
    icon_name: 'snow',
    base_rate: 450,
    rate_type: 'per_visit',
    estimated_duration: 60,
    is_active: true,
    tags: ['aircon', 'ac', 'cooling', 'filter'],
  },
  {
    title: 'General Handyman Service',
    description: 'All-around minor repairs: picture hanging, curtain rod installation, and miscellaneous fixes.',
    category: 'general_handyman',
    icon_name: 'construct',
    base_rate: 300,
    rate_type: 'hourly',
    estimated_duration: 60,
    is_active: true,
    tags: ['general', 'minor-repairs', 'handyman'],
  },
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    
    // Auto-seed services if no active services exist
    const activeCount = await Service.countDocuments({ is_active: true });
    if (activeCount === 0) {
      await Service.deleteMany({});
      await Service.insertMany(defaultServices);
      console.log('🌱 Successfully seeded default FixConnect services.');
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
