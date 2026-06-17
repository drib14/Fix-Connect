const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const { z } = require('zod');

const createBookingSchema = z.object({
  workerId: z.string(),
  serviceType: z.string(),
  description: z.string(),
  scheduledAt: z.string().transform((str) => new Date(str)),
  address: z.string(),
  coordinates: z.array(z.number()).length(2), // [longitude, latitude]
});

const createBooking = async (req, res, next) => {
  try {
    const data = createBookingSchema.parse(req.body);
    const userId = req.user.id;

    if (userId === data.workerId) {
      return res.status(400).json({ message: 'You cannot book yourself' });
    }

    const worker = await User.findById(data.workerId);
    if (!worker || worker.role !== 'WORKER' || worker.status !== 'APPROVED') {
      return res.status(404).json({ message: 'Worker not found or not approved' });
    }

    // Default price is hourly rate * 2 hours
    const estimatedPrice = (worker.hourlyRate || 50) * 2;

    const booking = await Booking.create({
      userId,
      workerId: data.workerId,
      serviceType: data.serviceType,
      description: data.description,
      scheduledAt: data.scheduledAt,
      address: data.address,
      coordinates: data.coordinates,
      price: estimatedPrice,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
    });

    res.status(201).json({ message: 'Booking requested successfully', booking });
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let filter = {};
    if (role === 'USER') {
      filter.userId = userId;
    } else if (role === 'WORKER') {
      filter.workerId = userId;
    }

    const bookings = await Booking.find(filter)
      .populate('userId', 'fullName email phoneNumber avatar')
      .populate('workerId', 'fullName email phoneNumber avatar specialty hourlyRate')
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('userId', 'fullName email phoneNumber avatar address coordinates')
      .populate('workerId', 'fullName email phoneNumber avatar specialty hourlyRate rating coordinates');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check permissions
    const userIdStr = req.user.id.toString();
    const role = req.user.role;
    if (
      role !== 'ADMIN' &&
      booking.userId._id.toString() !== userIdStr &&
      booking.workerId._id.toString() !== userIdStr
    ) {
      return res.status(403).json({ message: 'Forbidden: You do not have access to this booking' });
    }

    res.status(200).json({ booking });
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // ACCEPTED, DECLINED, IN_PROGRESS, COMPLETED, CANCELLED
    const userId = req.user.id;
    const role = req.user.role;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isUser = booking.userId.toString() === userId.toString();
    const isWorker = booking.workerId.toString() === userId.toString();

    if (!isUser && !isWorker && role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const validTransitions = {
      PENDING: ['ACCEPTED', 'DECLINED', 'CANCELLED'],
      ACCEPTED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED'],
      COMPLETED: [],
      DECLINED: [],
      CANCELLED: [],
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${booking.status} to ${status}`,
      });
    }

    // Role restrictions on transitions
    if (status === 'ACCEPTED' || status === 'DECLINED' || status === 'IN_PROGRESS' || status === 'COMPLETED') {
      if (!isWorker && role !== 'ADMIN') {
        return res.status(403).json({ message: 'Only workers can update booking progress' });
      }
    }

    if (status === 'CANCELLED') {
      if (!isUser && role !== 'ADMIN') {
        return res.status(403).json({ message: 'Only clients can cancel bookings' });
      }
    }

    booking.status = status;
    if (status === 'COMPLETED') {
      booking.completedAt = new Date();
    }

    await booking.save();
    res.status(200).json({ message: `Booking status updated to ${status}`, booking });
  } catch (error) {
    next(error);
  }
};

const sendChatMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isUser = booking.userId.toString() === userId.toString();
    const isWorker = booking.workerId.toString() === userId.toString();

    if (!isUser && !isWorker) {
      return res.status(403).json({ message: 'Only participants can send messages' });
    }

    booking.chat.push({
      senderId: userId,
      text,
      createdAt: new Date(),
    });

    await booking.save();

    res.status(201).json({ message: 'Message sent', chat: booking.chat });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only the client can review this booking' });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'You can only review completed bookings' });
    }

    if (booking.review && booking.review.rating) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }

    // Set review details
    booking.review = {
      rating,
      comment: comment || '',
      createdAt: new Date(),
    };

    await booking.save();

    // Recalculate worker's overall rating
    const workerId = booking.workerId;
    const completedBookingsWithReviews = await Booking.find({
      workerId,
      status: 'COMPLETED',
      'review.rating': { $exists: true, $ne: null },
    });

    const totalRatings = completedBookingsWithReviews.length;
    const sumRatings = completedBookingsWithReviews.reduce((acc, curr) => acc + curr.review.rating, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 5.0;

    await User.findByIdAndUpdate(workerId, {
      rating: Math.round(averageRating * 10) / 10,
      ratingsCount: totalRatings,
    });

    res.status(200).json({ message: 'Review submitted successfully', booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  sendChatMessage,
  createReview,
};
