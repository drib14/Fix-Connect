import './config/env.js';

import { createServer } from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { initSocket } from './socket.js';

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down server immediately...', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Create HTTP server to share with Socket.IO
  const httpServer = createServer(app);

  // Initialize Socket.IO
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    logger.info(`FixConnect MERN API + Socket.IO is actively listening on http://localhost:${PORT}`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down server gracefully...', err);
    httpServer.close(() => {
      process.exit(1);
    });
  });
};

startServer();
