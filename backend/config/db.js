import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    logger.error('MONGO_URI is not defined in the environment variables!');
    process.exit(1);
  }

  const options = {
    autoIndex: true,
  };

  let retries = 5;
  while (retries > 0) {
    try {
      logger.info('Attempting database connection...');
      await mongoose.connect(mongoUri, options);
      logger.info('MongoDB database connected successfully.');
      break;
    } catch (err) {
      retries -= 1;
      logger.error(`Database connection failed. Retries remaining: ${retries}`, err);
      if (retries === 0) {
        logger.error('Could not establish connection to database. Exiting process.');
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};
