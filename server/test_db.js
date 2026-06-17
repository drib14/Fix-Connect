require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing connection to MongoDB...');
console.log('URI:', process.env.MONGO_URI ? 'Defined' : 'Undefined');

const testConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    console.log('SUCCESS: Successfully connected to MongoDB Atlas!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('CONNECTION FAILED:');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Full Error Object:', err);
  }
};

testConnect();
