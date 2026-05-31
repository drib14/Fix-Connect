const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fixconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const User = require('./models/User');
  const admin = await User.findOne({ email: 'admin@fixconnect.com' }).select('+password');
  console.log(admin);
  const isMatch = await admin.matchPassword('AdminPassword123');
  console.log("Password matches:", isMatch);
  process.exit(0);
});
