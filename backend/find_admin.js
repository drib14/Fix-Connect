const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const User = require('./models/User');
  const admins = await User.find({ role: 'admin' });
  console.log("Found admins:");
  admins.forEach(a => console.log(`Email: ${a.email}`));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
