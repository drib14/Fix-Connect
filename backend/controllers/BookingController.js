import { Booking } from '../models/Booking.js';
import { WorkerProfile } from '../models/WorkerProfile.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { logger } from '../utils/logger.js';
import { emitNotification, emitBookingUpdate } from '../socket.js';

export class BookingController {
  // POST /api/bookings — Create a booking
  createBooking = async (req, res, next) => {
    try {
      if (req.user.role !== 'customer') {
        return next(new AppError('Only customers can create bookings', 403));
      }

      const { providerId, categoryId, description, address, scheduledAt, estimatedDuration, currency } = req.body;

      if (!providerId || !categoryId || !description || !scheduledAt) {
        return next(new AppError('Provider, category, description, and schedule date are required', 400));
      }

      // Get provider hourly rate for cost estimate
      const providerProfile = await WorkerProfile.findOne({ userId: providerId });
      const hourlyRate = providerProfile?.hourlyRate || 0;
      const duration = estimatedDuration || 1;
      const totalAmount = hourlyRate * duration;

      const booking = await Booking.create({
        customer: req.user.id,
        provider: providerId,
        category: categoryId,
        description,
        address: address || {},
        scheduledAt: new Date(scheduledAt),
        estimatedDuration: duration,
        totalAmount,
        currency: currency || req.user.currency || 'USD',
      });

      await booking.populate([
        { path: 'customer', select: 'name avatar email phone' },
        { path: 'provider', select: 'name avatar email phone' },
        { path: 'category', select: 'name iconName' },
      ]);

      // Notify provider of new booking request
      await emitNotification(String(providerId), {
        type: 'booking_request',
        title: 'New Booking Request',
        body: `${booking.customer.name} has requested your service for ${booking.category.name}`,
        relatedBooking: booking._id,
        relatedUser: req.user.id,
        iconType: 'calendar',
      });

      logger.info(`Booking created: ${booking.referenceNumber} by customer ${req.user.id}`);
      res.status(201).json({
        status: 'success',
        data: { booking },
      });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/bookings — Get user's bookings (role-filtered)
  getMyBookings = async (req, res, next) => {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const query = {};

      if (req.user.role === 'customer') {
        query.customer = req.user.id;
      } else if (req.user.role === 'provider') {
        query.provider = req.user.id;
      }

      if (status) query.status = status;

      const skip = (Number(page) - 1) * Number(limit);
      const total = await Booking.countDocuments(query);

      const bookings = await Booking.find(query)
        .populate('customer', 'name avatar phone')
        .populate('provider', 'name avatar phone')
        .populate('category', 'name iconName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      res.status(200).json({
        status: 'success',
        data: {
          bookings,
          pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/bookings/:id
  getBookingById = async (req, res, next) => {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate('customer', 'name avatar phone email location')
        .populate('provider', 'name avatar phone email location')
        .populate('category', 'name iconName slug');

      if (!booking) return next(new AppError('Booking not found', 404));

      // Only customer or provider involved can see
      const isCustomer = String(booking.customer._id) === req.user.id;
      const isProvider = String(booking.provider._id) === req.user.id;
      if (!isCustomer && !isProvider && req.user.role !== 'admin') {
        return next(new AppError('Access denied', 403));
      }

      res.status(200).json({
        status: 'success',
        data: { booking },
      });
    } catch (err) {
      next(err);
    }
  };

  // PATCH /api/bookings/:id/status — Update booking status
  updateBookingStatus = async (req, res, next) => {
    try {
      const { status, providerNotes, cancelReason } = req.body;

      const booking = await Booking.findById(req.params.id)
        .populate('customer', 'name')
        .populate('provider', 'name')
        .populate('category', 'name');

      if (!booking) return next(new AppError('Booking not found', 404));

      // Authorization checks
      const isProvider = String(booking.provider._id) === req.user.id;
      const isCustomer = String(booking.customer._id) === req.user.id;

      // Validate state transitions
      const allowedTransitions = {
        customer: { pending: ['cancelled'] },
        provider: {
          pending: ['accepted', 'declined'],
          accepted: ['in-progress', 'cancelled'],
          'in-progress': ['completed'],
        },
        admin: { pending: ['cancelled'], accepted: ['cancelled'], 'in-progress': ['cancelled'] },
      };

      const role = isProvider ? 'provider' : isCustomer ? 'customer' : req.user.role;
      const allowed = allowedTransitions[role]?.[booking.status] || [];

      if (!allowed.includes(status)) {
        return next(new AppError(`Cannot transition booking from '${booking.status}' to '${status}'`, 400));
      }

      // Apply timestamps
      const updates = { status };
      if (providerNotes) updates.providerNotes = providerNotes;
      if (cancelReason) updates.cancelReason = cancelReason;
      if (status === 'accepted') updates.acceptedAt = new Date();
      if (status === 'in-progress') updates.startedAt = new Date();
      if (status === 'completed') updates.completedAt = new Date();
      if (status === 'cancelled') updates.cancelledAt = new Date();

      Object.assign(booking, updates);
      await booking.save();

      // Emit real-time update to booking room
      emitBookingUpdate(booking._id.toString(), { bookingId: booking._id, status, updatedAt: new Date() });

      // Notify the other party
      const notifyUserId = isProvider ? String(booking.customer._id) : String(booking.provider._id);
      const notificationMap = {
        accepted: { title: 'Booking Accepted!', body: `${booking.provider.name} accepted your booking for ${booking.category.name}`, iconType: 'check' },
        declined: { title: 'Booking Declined', body: `${booking.provider.name} could not take your ${booking.category.name} booking`, iconType: 'x' },
        'in-progress': { title: 'Service Started', body: `${booking.provider.name} has started your ${booking.category.name} service`, iconType: 'alert' },
        completed: { title: 'Service Completed', body: `Your ${booking.category.name} booking has been completed. Please leave a review!`, iconType: 'star' },
        cancelled: { title: 'Booking Cancelled', body: `Booking #${booking.referenceNumber} has been cancelled`, iconType: 'x' },
      };

      if (notificationMap[status]) {
        await emitNotification(notifyUserId, {
          type: `booking_${status.replace('-', '_')}`,
          ...notificationMap[status],
          relatedBooking: booking._id,
          relatedUser: req.user.id,
        });
      }

      // Update provider's completed jobs count
      if (status === 'completed') {
        await WorkerProfile.findOneAndUpdate(
          { userId: booking.provider._id },
          { $inc: { completedJobs: 1 } }
        );
      }

      logger.info(`Booking ${booking.referenceNumber} status updated to ${status}`);
      res.status(200).json({
        status: 'success',
        data: { booking },
      });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/bookings/slots/:providerId — Get available time slots for a provider
  getAvailableSlots = async (req, res, next) => {
    try {
      const { date } = req.query;
      if (!date) return next(new AppError('Date is required', 400));

      const profile = await WorkerProfile.findOne({ userId: req.params.providerId });
      if (!profile) return next(new AppError('Provider not found', 404));

      const requestedDate = new Date(date);
      const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });

      // Check if provider works on this day
      if (!profile.availability.days.includes(dayName)) {
        return res.status(200).json({
          status: 'success',
          data: { slots: [], message: `Provider is not available on ${dayName}` },
        });
      }

      // Get existing bookings on this day
      const dayStart = new Date(requestedDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(requestedDate);
      dayEnd.setHours(23, 59, 59, 999);

      const existingBookings = await Booking.find({
        provider: req.params.providerId,
        scheduledAt: { $gte: dayStart, $lte: dayEnd },
        status: { $in: ['pending', 'accepted', 'in-progress'] },
      }).select('scheduledAt estimatedDuration');

      // Generate hourly slots between startTime and endTime
      const [startH, startM] = profile.availability.startTime.split(':').map(Number);
      const [endH, endM] = profile.availability.endTime.split(':').map(Number);

      const slots = [];
      for (let h = startH; h < endH || (h === endH && startM < endM); h++) {
        const slotStart = new Date(requestedDate);
        slotStart.setHours(h, 0, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setHours(h + 1, 0, 0, 0);

        // Check if slot conflicts
        const isBooked = existingBookings.some((b) => {
          const bStart = new Date(b.scheduledAt);
          const bEnd = new Date(bStart);
          bEnd.setHours(bEnd.getHours() + (b.estimatedDuration || 1));
          return slotStart < bEnd && slotEnd > bStart;
        });

        slots.push({
          time: `${String(h).padStart(2, '0')}:00`,
          label: slotStart.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
          available: !isBooked && slotStart > new Date(),
        });
      }

      res.status(200).json({
        status: 'success',
        data: { slots, date, dayName },
      });
    } catch (err) {
      next(err);
    }
  };
}
