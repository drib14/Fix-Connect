const socketIo = require('socket.io');
let io;
module.exports = {
    init: (server) => {
        io = socketIo(server, { cors: { origin: "*", methods: ["GET", "POST"] } });
        io.on('connection', (socket) => {
            socket.on('join', (userId) => socket.join(userId));
            socket.on('joinBooking', (bookingId) => socket.join(bookingId));
        });
        return io;
    },
    getIO: () => {
        if (!io) throw new Error('Socket.io not initialized!');
        return io;
    }
};
