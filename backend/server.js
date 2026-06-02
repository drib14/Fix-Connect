import './config/env.js';

import app from './app.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down server immediately...', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`FixConnect MERN API is actively listening on http://localhost:${PORT}`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down server gracefully...', err);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
