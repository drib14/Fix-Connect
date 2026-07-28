const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load env variables
dotenv.config({ path: path.join(__dirname, "../../.env") });
dotenv.config();

const ServiceCategory = require("../models/ServiceCategory");
const Booking = require("../models/Booking");

const cleanDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("Connecting to database...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    // Delete seeded service categories
    const categoryResult = await ServiceCategory.deleteMany({});
    console.log(`Deleted ${categoryResult.deletedCount} service categories.`);

    // Optionally delete old mock bookings if any exist
    const bookingResult = await Booking.deleteMany({});
    console.log(`Deleted ${bookingResult.deletedCount} booking records.`);

    console.log("Database cleanup completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Database cleanup error:", error.message);
    process.exit(1);
  }
};

cleanDatabase();
