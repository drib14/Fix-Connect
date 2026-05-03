const socketIo = require('socket.io');

let io;

module.exports = {
    init: (server) => {
        io = socketIo(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            socket.on('join', (userId) => {
                socket.join(userId);
                console.log(`User ${userId} joined their room`);
            });

            socket.on('joinBooking', (bookingId) => {
                socket.join(bookingId);
                console.log(`Socket joined booking room: ${bookingId}`);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};
