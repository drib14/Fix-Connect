/**
 * Seed script to populate the Services collection with default FixConnect services.
 * Run with: npm run seed
 */
require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Service = require('../models/Service');

const services = [
  // Cleaning
  {
    title: 'General House Cleaning',
    description: 'Full deep cleaning of your home including mopping, dusting, and sanitizing all rooms.',
    category: 'cleaning',
    icon_name: 'sparkles',
    base_rate: 500,
    rate_type: 'per_visit',
    estimated_duration: 120,
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
    tags: ['kitchen', 'grease', 'appliance'],
  },
  // Plumbing
  {
    title: 'Pipe Leak Repair',
    description: 'Diagnose and fix leaking pipes, faucets, and water connections throughout your home.',
    category: 'plumbing',
    icon_name: 'water',
    base_rate: 400,
    rate_type: 'fixed',
    estimated_duration: 60,
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
    tags: ['clog', 'drain', 'sink'],
  },
  {
    title: 'Toilet Repair',
    description: 'Fix running toilets, replace flush mechanisms, and solve overflow issues.',
    category: 'plumbing',
    icon_name: 'water',
    base_rate: 350,
    rate_type: 'fixed',
    estimated_duration: 45,
    tags: ['toilet', 'flush', 'overflow'],
  },
  // Electrical
  {
    title: 'Outlet & Switch Installation',
    description: 'Install or replace electrical outlets, switches, and wall plates safely.',
    category: 'electrical',
    icon_name: 'flash',
    base_rate: 300,
    rate_type: 'fixed',
    estimated_duration: 30,
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
    tags: ['lighting', 'chandelier', 'fixture'],
  },
  {
    title: 'Electrical Troubleshooting',
    description: 'Diagnose and resolve electrical issues including tripped breakers and faulty wiring.',
    category: 'electrical',
    icon_name: 'warning',
    base_rate: 500,
    rate_type: 'hourly',
    estimated_duration: 60,
    tags: ['diagnosis', 'breaker', 'wiring'],
  },
  // Appliance Repair
  {
    title: 'Aircon Cleaning & Maintenance',
    description: 'Professional split-type or window AC cleaning, filter replacement, and freon check.',
    category: 'appliance_repair',
    icon_name: 'snow',
    base_rate: 450,
    rate_type: 'per_visit',
    estimated_duration: 60,
    tags: ['aircon', 'ac', 'cooling', 'filter'],
  },
  {
    title: 'Washing Machine Repair',
    description: 'Troubleshoot and fix washing machine drainage, spin, and motor issues.',
    category: 'appliance_repair',
    icon_name: 'settings',
    base_rate: 500,
    rate_type: 'fixed',
    estimated_duration: 90,
    tags: ['washer', 'laundry', 'motor'],
  },
  // Carpentry
  {
    title: 'Furniture Assembly',
    description: 'Assemble flat-pack furniture, shelving units, and modular cabinets.',
    category: 'carpentry',
    icon_name: 'hammer',
    base_rate: 400,
    rate_type: 'hourly',
    estimated_duration: 90,
    tags: ['furniture', 'assembly', 'shelves'],
  },
  {
    title: 'Door & Cabinet Repair',
    description: 'Fix squeaky hinges, broken handles, misaligned doors, and damaged cabinets.',
    category: 'carpentry',
    icon_name: 'construct',
    base_rate: 350,
    rate_type: 'fixed',
    estimated_duration: 60,
    tags: ['door', 'cabinet', 'hinge'],
  },
  // Painting
  {
    title: 'Interior Wall Painting',
    description: 'Professional interior wall painting with prep, primer, and two coats of paint.',
    category: 'painting',
    icon_name: 'color-palette',
    base_rate: 800,
    rate_type: 'per_visit',
    estimated_duration: 240,
    tags: ['wall', 'interior', 'paint'],
  },
  // Pest Control
  {
    title: 'General Pest Treatment',
    description: 'Treatment for cockroaches, ants, mosquitoes, and common household pests.',
    category: 'pest_control',
    icon_name: 'bug',
    base_rate: 600,
    rate_type: 'per_visit',
    estimated_duration: 60,
    tags: ['pest', 'cockroach', 'ant', 'mosquito'],
  },
  // General Handyman
  {
    title: 'General Handyman Service',
    description: 'All-around minor repairs: picture hanging, curtain rod installation, and miscellaneous fixes.',
    category: 'general_handyman',
    icon_name: 'construct',
    base_rate: 300,
    rate_type: 'hourly',
    estimated_duration: 60,
    tags: ['general', 'minor-repairs', 'handyman'],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Service.deleteMany({});
    console.log('🗑️  Cleared existing services');

    const created = await Service.insertMany(services);
    console.log(`✅ Seeded ${created.length} services`);

    await mongoose.disconnect();
    console.log('✅ Done. Database disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
