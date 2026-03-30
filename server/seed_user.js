const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function seedUser() {
  await mongoose.connect(process.env.MONGODB_URI);

  const email = 'profiletest@test.com';
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({
      email,
      password: 'Password@123',
      location: { region: '13', province: '1339', city: '133900' },
      isVerified: true
    });
    await user.save();
    console.log('User created');
  } else {
    console.log('User already exists');
  }

  process.exit(0);
}

seedUser();
