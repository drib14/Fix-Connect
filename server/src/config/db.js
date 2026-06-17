const mongoose = require('mongoose');
const User = require('../models/user.model');
const SystemConfig = require('../models/config.model');
const Blog = require('../models/blog.model');
const ServiceCategory = require('../models/category.model');
const { hashPassword } = require('../utils/hash');

const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@fixconnect.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const hashedPassword = await hashPassword('FixConnect2026');
      await User.create({
        fullName: 'Administrator',
        email: adminEmail,
        phoneNumber: '09000000000',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        onboardingCompleted: true,
        status: 'APPROVED',
      });
      console.log('Seeded default admin account: admin@fixconnect.com | FixConnect2026');
    } else {
      console.log('Admin account admin@fixconnect.com already exists.');
    }
  } catch (err) {
    console.error('Failed to seed admin account on startup:', err.message);
  }
};

const seedConfigsAndBlogs = async () => {
  try {
    const termsExists = await SystemConfig.findOne({ key: 'terms_and_conditions' });
    if (!termsExists) {
      await SystemConfig.create({
        key: 'terms_and_conditions',
        value: `# Terms and Conditions

Last updated: June 2026

## 1. Acceptance of Terms
By registering or using the Fix-Connect User or Partner applications, you agree to be bound by these Terms and Conditions. If you do not agree, you must immediately terminate use of our software assets.

## 2. Description of Service
Fix-Connect is a connection software platform that allows Client Users to request handyman and home-fixing bookings from third-party Worker Partners. Fix-Connect is not an employer of the workers and operates solely as a discovery and payment link provider.

## 3. Billing and Transactions
Invoice payments are calculated based on the Worker Partner's hourly rate and the estimated booking duration. All transactions are securely simulated or routed through Paymongo sandbox payment gateway links. Fix-Connect does not store card details.

## 4. Partner Verifications
All Worker Partners are required to submit government-issued identification cards and specialty certificates. While administration operators review and verify these submissions, Client Users are encouraged to verify certifications upon provider arrival.`,
      });
      console.log('Seeded default Terms and Conditions config.');
    }

    const privacyExists = await SystemConfig.findOne({ key: 'privacy_policy' });
    if (!privacyExists) {
      await SystemConfig.create({
        key: 'privacy_policy',
        value: `# Privacy Policy

Last updated: June 2026

## 1. Information We Collect
We collect credentials (name, email, hashed password, phone number), geocoding address locations processed via LocationIQ, and document verification references (Government IDs, specialty certifications) uploaded by Worker Partners.

## 2. Usage of Coordinates
Coordinates collected are used solely to compute the physical proximity distance (in km) between requesting Client Users and available Worker Partners, enabling accurate routing and dispatching.

## 3. Security Safeguards
Hashed passwords and authentication tokens are encrypted and handled using industry standards. Document verifications are stored secure and accessible only to verified Administration operators.`,
      });
      console.log('Seeded default Privacy Policy config.');
    }

    const feeExists = await SystemConfig.findOne({ key: 'platform_fee_percent' });
    if (!feeExists) {
      await SystemConfig.create({ key: 'platform_fee_percent', value: '10' });
      console.log('Seeded default platform fee config.');
    }

    const taxExists = await SystemConfig.findOne({ key: 'tax_percent' });
    if (!taxExists) {
      await SystemConfig.create({ key: 'tax_percent', value: '12' });
      console.log('Seeded default tax config.');
    }

    const emergencyExists = await SystemConfig.findOne({ key: 'emergency_contact' });
    if (!emergencyExists) {
      await SystemConfig.create({ key: 'emergency_contact', value: '+63 911 000 1111' });
      console.log('Seeded default emergency contact config.');
    }

    const broadcastExists = await SystemConfig.findOne({ key: 'alert_broadcast' });
    if (!broadcastExists) {
      await SystemConfig.create({ key: 'alert_broadcast', value: 'Welcome to the Fix-Connect Administrative Console. All backend systems operational.' });
      console.log('Seeded default system broadcast alert.');
    }

    const blogsCount = await Blog.countDocuments();
    if (blogsCount === 0) {
      await Blog.create([
        {
          title: 'Safe Vetting: Worker Verification Standards',
          excerpt: 'How Fix-Connect uses identity validation and certificates to ensure client safety in local neighborhoods.',
          author: 'Operations Team',
          slug: 'safe-vetting-worker-verification-standards',
          content: 'At Fix-Connect, trust is our primary currency. Every worker applying to offer local services must complete a rigorous profile submission including local government identification card entries, certificates of specialization (e.g. plumbing licenses), and radial limits of work. These documents are directly inspected and manually verified by our administration dashboard operator. If any information does not match public license files, the registration is rejected. This ensures clients book only safe, qualified professionals.'
        },
        {
          title: 'GCash Sandbox Payment Flows via Paymongo',
          excerpt: 'Detailing our simulated sandbox link integration for immediate provider invoicing and payment completions.',
          author: 'Engineering',
          slug: 'gcash-sandbox-payment-flows-via-paymongo',
          content: 'To support seamless local contractor payments, Fix-Connect integrates Paymongo checkout services. Upon worker completion, an estimated invoice is immediately pushed to the client mobile app. The user clicks to checkout, generating a secure checkout token link. In this sandbox development env, we simulate the payment processing (using mock GCash or Card credentials) which safely notifies the API backend to update the booking status to PAID. This ensures zero transaction delay between local partners and clients.'
        },
        {
          title: 'Understanding Geocoding Proximity Calculations',
          excerpt: 'A deep dive into how LocationIQ coordinates calculate distances between clients and workers.',
          author: 'Product Team',
          slug: 'understanding-geocoding-proximity-calculations',
          content: 'When a Client registers, they complete location geocoding by searching for their street address. Behind the scenes, the LocationIQ API resolves this text address into coordinates (longitude, latitude). When searching for handymen, our backend utilizes the Haversine formula to compute the direct physical distance in kilometers between the client coordinates and all approved worker coordinates. Workers are automatically sorted by proximity, allowing clients to book local providers nearest to them.'
        }
      ]);
      console.log('Seeded default blog articles.');
    }
  } catch (err) {
    console.error('Failed to seed configs and blogs:', err.message);
  }
};

const seedCategories = async () => {
  try {
    const count = await ServiceCategory.countDocuments();
    if (count === 0) {
      await ServiceCategory.create([
        { title: 'Plumbing', description: 'Leak repairs, pipe installations, drain cleaning, and general fixing.', basePrice: 150 },
        { title: 'Electrical', description: 'Wiring diagnostics, light fixture installations, switch fixes, and diagnostics.', basePrice: 200 },
        { title: 'Cleaning', description: 'Deep room sanitizing, window washing, and general post-construction cleanups.', basePrice: 80 },
        { title: 'Gardening', description: 'Lawn mowing, pruning, landscaping, and garden maintenance.', basePrice: 90 },
        { title: 'Appliance Repair', description: 'Air conditioner fixes, refrigerator repairs, washing machines diagnostics.', basePrice: 180 }
      ]);
      console.log('Seeded default service categories.');
    }
  } catch (err) {
    console.error('Failed to seed categories:', err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedAdmin();
    await seedConfigsAndBlogs();
    await seedCategories();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
