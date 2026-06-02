import { Message } from '../models/Message.js';
import { Booking } from '../models/Booking.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { getIO } from '../socket.js';

export class ChatController {
  // GET /api/chat/:bookingId — Fetch message history
  getMessages = async (req, res, next) => {
    try {
      const booking = await Booking.findById(req.params.bookingId);
      if (!booking) return next(new AppError('Booking not found', 404));

      // Only involved parties
      const isParty =
        String(booking.customer) === req.user.id ||
        String(booking.provider) === req.user.id;
      if (!isParty && req.user.role !== 'admin') {
        return next(new AppError('Access denied', 403));
      }

      const messages = await Message.find({ booking: req.params.bookingId })
        .populate('sender', 'name avatar role')
        .sort({ createdAt: 1 })
        .lean();

      // Mark messages as read for this user
      await Message.updateMany(
        { booking: req.params.bookingId, receiver: req.user.id, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      res.status(200).json({
        status: 'success',
        data: { messages },
      });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/chat/:bookingId — Send message (REST fallback for non-socket)
  sendMessage = async (req, res, next) => {
    try {
      const { text, receiverId } = req.body;
      if (!text?.trim()) return next(new AppError('Message text is required', 400));

      const booking = await Booking.findById(req.params.bookingId);
      if (!booking) return next(new AppError('Booking not found', 404));

      const isParty =
        String(booking.customer) === req.user.id ||
        String(booking.provider) === req.user.id;
      if (!isParty) return next(new AppError('Access denied', 403));

      const message = await Message.create({
        booking: req.params.bookingId,
        sender: req.user.id,
        receiver: receiverId,
        text: text.trim(),
      });

      const populated = await message.populate('sender', 'name avatar role');

      // Also emit via socket if available
      try {
        const io = getIO();
        io.to(`booking:${req.params.bookingId}`).emit('new-message', populated);
      } catch (_) { /* socket might not be available */ }

      res.status(201).json({
        status: 'success',
        data: { message: populated },
      });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/chat/conversations — All conversations (unique bookings with messages)
  getConversations = async (req, res, next) => {
    try {
      // Get all bookings where user is involved
      const query = req.user.role === 'customer'
        ? { customer: req.user.id }
        : { provider: req.user.id };

      const bookings = await Booking.find({ ...query, status: { $ne: 'pending' } })
        .populate('customer', 'name avatar')
        .populate('provider', 'name avatar')
        .populate('category', 'name')
        .sort({ updatedAt: -1 })
        .lean();

      // Get last message + unread count per booking
      const conversations = await Promise.all(
        bookings.map(async (b) => {
          const lastMessage = await Message.findOne({ booking: b._id })
            .sort({ createdAt: -1 })
            .populate('sender', 'name')
            .lean();

          const unreadCount = await Message.countDocuments({
            booking: b._id,
            receiver: req.user.id,
            isRead: false,
          });

          const otherParty = req.user.role === 'customer' ? b.provider : b.customer;
          return {
            bookingId: b._id,
            referenceNumber: b.referenceNumber,
            status: b.status,
            category: b.category,
            otherParty,
            lastMessage,
            unreadCount,
          };
        })
      );

      res.status(200).json({
        status: 'success',
        data: { conversations },
      });
    } catch (err) {
      next(err);
    }
  };
}
