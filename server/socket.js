const { Server } = require("socket.io");

let io;

module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174', process.env.FRONTEND_URL],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Join a specific room based on user/worker ID for direct messaging or personal events
      socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
      });

      // Join a booking specific room for real-time location sharing
      socket.on('joinBookingRoom', (bookingId) => {
        socket.join(bookingId);
        console.log(`Socket ${socket.id} joined booking room ${bookingId}`);
      });

      // Real-time location update
      socket.on('locationUpdate', (data) => {
        // data should contain { bookingId, lat, lng }
        if (data.bookingId) {
          // Broadcast to everyone in the booking room except the sender
          socket.to(data.bookingId).emit('workerLocation', data);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  }
};
