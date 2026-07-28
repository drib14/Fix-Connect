const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("[MongoDB Connected]");
  } catch (error) {
    console.error(`[MongoDB Error]: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

