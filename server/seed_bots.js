const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Worker = require('./models/Worker');
const User = require('./models/User');

// Philippine coordinates (roughly bounding box for regions)
// We'll generate random coordinates within these bounds to simulate spread across the PH
const phBounds = {
    minLat: 5.88,
    maxLat: 19.14,
    minLng: 116.92,
    maxLng: 126.60
};

// Simplified provinces list for distribution
const provinces = [
    'Metro Manila', 'Cebu', 'Davao del Sur', 'Cavite', 'Laguna',
    'Batangas', 'Rizal', 'Pampanga', 'Bulacan', 'Iloilo',
    'Negros Occidental', 'Palawan', 'Bohol', 'Zamboanga del Sur',
    'Misamis Oriental', 'Pangasinan', 'Nueva Ecija', 'Tarlac',
    'Quezon', 'Leyte', 'Samar', 'Cagayan', 'Isabela',
    // ... add more to cover regions conceptually
];

const categories = ['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 'AC Repair'];
const firstNames = ['Juan', 'Pedro', 'Jose', 'Maria', 'Ana', 'Miguel', 'Luis', 'Carlos', 'Rosa', 'Carmen', 'Bot'];
const lastNames = ['Dela Cruz', 'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Torres', 'Aquino'];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomCoordinate(min, max) {
    return Math.random() * (max - min) + min;
}

const seedBots = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB for seeding bots...');

        const WORKERS_PER_PROVINCE = 5;
        const totalBots = provinces.length * WORKERS_PER_PROVINCE;
        console.log(`Seeding ${totalBots} bot workers...`);

        let botCount = 0;

        // Use a static password for bots
        const passwordStr = 'botpassword123';
        // Bcrypt hashing happens in the model's pre-save middleware for User
        // But for performance on 100+ users, we can hash it once if we insertMany,
        // but since User model has pre-save, we'll do it individually or handle it carefully.

        for (let i = 0; i < provinces.length; i++) {
            const province = provinces[i];

            for (let j = 0; j < WORKERS_PER_PROVINCE; j++) {
                const firstName = getRandomItem(firstNames);
                const lastName = `${getRandomItem(lastNames)} (Bot ${j+1})`;
                const email = `bot_${i}_${j}@fixconnect.ph`;
                const category = getRandomItem(categories);

                // Create User
                let user = await User.findOne({ email });
                if (!user) {
                    user = new User({
                        firstName,
                        lastName,
                        email,
                        password: passwordStr,
                        role: 'worker',
                        isBot: true
                    });
                    await user.save();
                }

                // Random coordinate roughly in PH
                // To be more precise, you'd use actual province coordinates, but for random seeding, this is a proxy.
                const lat = getRandomCoordinate(phBounds.minLat, phBounds.maxLat);
                const lng = getRandomCoordinate(phBounds.minLng, phBounds.maxLng);

                // Create Worker
                const existingWorker = await Worker.findOne({ userId: user._id });
                if (!existingWorker) {
                    const worker = new Worker({
                        userId: user._id,
                        name: `${firstName} ${lastName}`,
                        category,
                        description: `Hi, I am an automated bot worker in ${province}. I specialize in ${category}.`,
                        jobsOffered: ['General Service', 'Inspection', 'Repair'],
                        status: 'Active',
                        currentLocation: { lat, lng },
                        isBot: true,
                        rating: 5.0,
                        dailyRate: 1500,
                        imageUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=10b981&color=fff`
                    });
                    await worker.save();
                    botCount++;
                }
            }
            if ((i + 1) % 5 === 0) console.log(`Seeded bots for ${i + 1} provinces...`);
        }

        console.log(`Successfully seeded ${botCount} new bot workers.`);
        process.exit();
    } catch (err) {
        console.error('Error seeding bots:', err);
        process.exit(1);
    }
};

seedBots();
