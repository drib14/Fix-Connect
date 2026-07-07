const jwt = require('jsonwebtoken');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');

/**
 * Initialize the /bookings WebSocket namespace.
 * Handles real-time provider location tracking, status transitions,
 * and in-booking chat messaging.
 */
function initBookingSocket(io) {
  const bookingNsp = io.of('/bookings');

  // Authenticate socket connections via JWT
  bookingNsp.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  bookingNsp.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.id} (${socket.user.role || 'user'})`);

    /**
     * User joins their active booking room.
     */
    socket.on('join_booking', ({ bookingId }) => {
      socket.join(`booking_${bookingId}`);
      console.log(`👤 User ${socket.user.id} joined room: booking_${bookingId}`);
    });

    /**
     * Provider joins their own notification room.
     */
    socket.on('join_provider_room', ({ providerId }) => {
      socket.join(`provider_${providerId}`);
      console.log(`🔧 Provider ${providerId} joined their notification room`);
    });

    /**
     * Provider accepts a booking job.
     * Transitions: SEARCHING -> ACCEPTED
     */
    socket.on('accept_job', async ({ bookingId, providerId }) => {
      try {
        const booking = await Booking.findById(bookingId);
        if (!booking || booking.status !== 'SEARCHING') return;

        const provider = await Provider.findById(providerId);
        if (!provider) return;

        booking.status = 'ACCEPTED';
        booking.provider_id = providerId;
        booking.accepted_at = new Date();
        await booking.save();

        provider.active_status = 'busy';
        await provider.save();

        // Notify user that a provider accepted
        bookingNsp.to(`booking_${bookingId}`).emit('booking_accepted', {
          provider: {
            _id: provider._id,
            name: provider.name,
            avatar_url: provider.avatar_url,
            phone: provider.phone,
            average_rating: provider.average_rating,
            total_completed: provider.total_completed,
          },
        });

        bookingNsp.to(`booking_${bookingId}`).emit('status_change', {
          status: 'ACCEPTED',
        });
      } catch (err) {
        console.error('Accept job error:', err);
      }
    });

    /**
     * Provider sends live location update.
     * Relayed to the user in the booking room.
     */
    socket.on('location_update', ({ bookingId, lat, lon, bearing, eta }) => {
      bookingNsp.to(`booking_${bookingId}`).emit('location_update', {
        lat,
        lon,
        bearing,
        eta,
        timestamp: Date.now(),
      });
    });

    /**
     * Provider triggers a status transition.
     * EN_ROUTE -> ARRIVED -> IN_PROGRESS -> COMPLETED
     */
    socket.on('update_status', async ({ bookingId, status, otpCode }) => {
      try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return;

        const validTransitions = {
          ACCEPTED: 'EN_ROUTE',
          EN_ROUTE: 'ARRIVED',
          ARRIVED: 'IN_PROGRESS',
          IN_PROGRESS: 'COMPLETED',
        };

        if (validTransitions[booking.status] !== status) {
          socket.emit('error', { message: `Invalid transition: ${booking.status} -> ${status}` });
          return;
        }

        // OTP verification required for ARRIVED -> IN_PROGRESS
        if (status === 'IN_PROGRESS' && booking.otp_code !== otpCode) {
          socket.emit('error', { message: 'Invalid verification code.' });
          return;
        }

        booking.status = status;
        if (status === 'EN_ROUTE') booking.en_route_at = new Date();
        if (status === 'ARRIVED') booking.arrived_at = new Date();
        if (status === 'IN_PROGRESS') booking.started_at = new Date();
        if (status === 'COMPLETED') {
          booking.completed_at = new Date();
          // Free up provider
          await Provider.findByIdAndUpdate(booking.provider_id, {
            active_status: 'online',
            $inc: { total_completed: 1 },
          });
        }
        await booking.save();

        bookingNsp.to(`booking_${bookingId}`).emit('status_change', {
          status,
          otp_code: status === 'ARRIVED' ? booking.otp_code : undefined,
        });
      } catch (err) {
        console.error('Update status error:', err);
      }
    });

    /**
     * In-booking chat messaging.
     */
    socket.on('chat_message', ({ bookingId, message }) => {
      bookingNsp.to(`booking_${bookingId}`).emit('chat_message', {
        senderId: socket.user.id,
        message,
        timestamp: Date.now(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.id}`);
    });
  });

  return bookingNsp;
}

module.exports = { initBookingSocket };
