const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Worker = require('./models/Worker');
const User = require('./models/User');

// Specific coordinates for major Philippine cities to ensure bots spawn on land.
// We'll add a tiny random offset to these base coordinates to spread them out slightly.
const phCityCenters = [
    { name: 'Metro Manila', lat: 14.5995, lng: 120.9842 },
    { name: 'Cebu City', lat: 10.3157, lng: 123.8854 },
    { name: 'Davao City', lat: 7.1907, lng: 125.4553 },
    { name: 'Baguio City', lat: 16.4023, lng: 120.5960 },
    { name: 'Iloilo City', lat: 10.7202, lng: 122.5621 },
    { name: 'Bacolod City', lat: 10.6667, lng: 122.9500 },
    { name: 'Cagayan de Oro', lat: 8.4542, lng: 124.6319 },
    { name: 'Zamboanga City', lat: 6.9214, lng: 122.0790 },
    { name: 'General Santos', lat: 6.1164, lng: 125.1716 },
    { name: 'Angeles City', lat: 15.1398, lng: 120.5926 },
    { name: 'Legazpi City', lat: 13.1391, lng: 123.7353 },
    { name: 'Naga City', lat: 13.6268, lng: 123.1858 },
    { name: 'Tacloban City', lat: 11.2430, lng: 125.0081 },
    { name: 'Lucena City', lat: 11.9333, lng: 121.5333 },
    { name: 'Puerto Princesa', lat: 9.7429, lng: 118.7363 },
    { name: 'Tagbilaran City', lat: 9.6482, lng: 123.8561 },
    { name: 'Dumaguete City', lat: 9.3068, lng: 123.3005 },
    { name: 'Butuan City', lat: 8.9492, lng: 125.5436 },
    { name: 'Iligan City', lat: 8.2280, lng: 124.2452 },
    { name: 'Cotabato City', lat: 7.2243, lng: 124.2460 },
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
        const totalBots = phCityCenters.length * WORKERS_PER_PROVINCE;
        console.log(`Seeding ${totalBots} bot workers...`);

        let botCount = 0;

        const passwordStr = 'botpassword123';

        for (let i = 0; i < phCityCenters.length; i++) {
            const city = phCityCenters[i];

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

                // Apply a small random offset (~1-5km) to the city center to spread bots out
                const latOffset = (Math.random() - 0.5) * 0.05;
                const lngOffset = (Math.random() - 0.5) * 0.05;
                const lat = city.lat + latOffset;
                const lng = city.lng + lngOffset;

                // Create Worker
                const existingWorker = await Worker.findOne({ userId: user._id });
                if (!existingWorker) {
                    const worker = new Worker({
                        userId: user._id,
                        name: `${firstName} ${lastName}`,
                        category,
                        description: `Hi, I am an automated bot worker in ${city.name}. I specialize in ${category}.`,
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
