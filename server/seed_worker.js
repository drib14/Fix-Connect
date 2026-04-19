const mongoose = require('mongoose');
require('dotenv').config();
const Worker = require('./models/Worker');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedWorker = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Check if user exists, else create
        let user = await User.findOne({ email: 'worker@test.com' });
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            user = new User({
                firstName: 'Test',
                lastName: 'Worker',
                email: 'worker@test.com',
                password: hashedPassword,
                role: 'worker'
            });
            await user.save();
        }

        // Check if worker profile exists
        const existingWorker = await Worker.findOne({ userId: user._id });
        if (!existingWorker) {
            const worker = new Worker({
                userId: user._id,
                name: 'Test Worker',
                category: 'Plumbing',
                description: 'Expert Plumber',
                jobsOffered: ['Pipe repair', 'Installations'],
                status: 'Active',
                currentLocation: { lat: 14.6091, lng: 120.9822 } // Mock Manila location
            });
            await worker.save();
            console.log('Mock worker seeded.');
        } else {
            existingWorker.currentLocation = { lat: 14.6091, lng: 120.9822 };
            await existingWorker.save();
            console.log('Worker already exists. Updated location.');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedWorker();
