const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Provider = require('../models/Provider');
const Review = require('../models/Review');
const { calculateFare } = require('../utils/fareCalculator');
const { generateOTP } = require('../utils/otpGenerator');

/**
 * POST /api/bookings/draft
 * Creates a new booking in DRAFT status with fare calculation.
 */
exports.createDraft = async (req, res) => {
  try {
    const {
      service_id,
      latitude,
      longitude,
      formatted_address,
      problem_description,
      attachment_urls,
      scheduled_at,
    } = req.body;

    if (!service_id || !latitude || !longitude || !formatted_address || !problem_description) {
      return res.status(400).json({ message: 'Missing required booking fields.' });
    }

    const service = await Service.findById(service_id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    // Calculate fare
    const fare = calculateFare(service.base_rate, 0);
    const otpCode = generateOTP();

    const booking = await Booking.create({
      user_id: req.user.id,
      service_id,
      status: 'DRAFT',
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      formatted_address,
      problem_description,
      attachment_urls: attachment_urls || [],
      base_fare: fare.baseFare,
      platform_fee: fare.platformFee,
      distance_fee: fare.distanceFee,
      total_amount: fare.totalAmount,
      otp_code: otpCode,
      is_scheduled: !!scheduled_at,
      scheduled_at: scheduled_at || null,
    });

    const populated = await Booking.findById(booking._id).populate('service_id');

    res.status(201).json({
      message: 'Booking draft created.',
      booking: populated,
    });
  } catch (error) {
    console.error('Create draft error:', error);
    res.status(500).json({ message: 'Failed to create booking draft.' });
  }
};

/**
 * POST /api/bookings/:id/request
 * Moves booking from DRAFT to SEARCHING and begins provider matching.
 */
exports.requestProvider = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user_id: req.user.id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    if (booking.status !== 'DRAFT') {
      return res.status(400).json({ message: `Cannot request from status: ${booking.status}` });
    }

    booking.status = 'SEARCHING';
    booking.search_started_at = new Date();
    await booking.save();

    // Notify nearby providers via Socket.io
    const io = req.app.get('io');
    const bookingNamespace = io.of('/bookings');

    // Find online providers who service this category
    const service = await Service.findById(booking.service_id);
    const nearbyProviders = await Provider.find({
      active_status: 'online',
      specialty_services: booking.service_id,
      current_location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: booking.location.coordinates,
          },
          $maxDistance: booking.search_radius_km * 1000,
        },
      },
    }).limit(10);

    // Emit new job event to provider room
    const providerIds = nearbyProviders.map(p => p._id.toString());
    booking.providers_notified = providerIds;
    await booking.save();

    providerIds.forEach(pid => {
      bookingNamespace.to(`provider_${pid}`).emit('new_job', {
        bookingId: booking._id,
        service: service?.title,
        category: service?.category,
        address: booking.formatted_address,
        totalAmount: booking.total_amount,
        location: booking.location.coordinates,
      });
    });

    res.json({
      message: 'Searching for providers...',
      booking,
      providersFound: nearbyProviders.length,
    });
  } catch (error) {
    console.error('Request provider error:', error);
    res.status(500).json({ message: 'Failed to start provider search.' });
  }
};

/**
 * GET /api/bookings/active
 * Returns the user's currently active booking (non-terminal states).
 */
exports.getActiveBooking = async (req, res) => {
  try {
    const activeStatuses = ['SEARCHING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'];

    const booking = await Booking.findOne({
      user_id: req.user.id,
      status: { $in: activeStatuses },
    })
      .populate('service_id')
      .populate('provider_id')
      .sort({ created_at: -1 });

    res.json({ booking });
  } catch (error) {
    console.error('Get active booking error:', error);
    res.status(500).json({ message: 'Failed to fetch active booking.' });
  }
};

/**
 * GET /api/bookings/history
 * Returns paginated booking history.
 */
exports.getBookingHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const terminalStatuses = ['COMPLETED', 'CANCELLED', 'EXPIRED'];

    const [bookings, total] = await Promise.all([
      Booking.find({
        user_id: req.user.id,
        status: { $in: terminalStatuses },
      })
        .populate('service_id')
        .populate('provider_id')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({
        user_id: req.user.id,
        status: { $in: terminalStatuses },
      }),
    ]);

    res.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Failed to fetch booking history.' });
  }
};

/**
 * GET /api/bookings/:id
 * Returns a single booking by ID.
 */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user_id: req.user.id })
      .populate('service_id')
      .populate('provider_id');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Failed to fetch booking.' });
  }
};

/**
 * POST /api/bookings/:id/cancel
 * Cancels a booking. Applies cancellation rules based on current state.
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const cancellableStatuses = ['DRAFT', 'SEARCHING', 'ACCEPTED', 'EN_ROUTE'];
    if (!cancellableStatuses.includes(booking.status)) {
      return res.status(400).json({ message: `Cannot cancel booking in ${booking.status} status.` });
    }

    // Apply cancellation fee if provider is already en route
    let cancellationFee = 0;
    if (['ACCEPTED', 'EN_ROUTE'].includes(booking.status)) {
      cancellationFee = Math.round(booking.total_amount * 0.2); // 20% cancellation fee
    }

    booking.status = 'CANCELLED';
    booking.cancelled_at = new Date();
    booking.cancel_reason = reason || 'User cancelled';
    booking.cancelled_by = 'user';
    await booking.save();

    // Notify provider via socket
    if (booking.provider_id) {
      const io = req.app.get('io');
      io.of('/bookings').to(`booking_${booking._id}`).emit('status_change', {
        status: 'CANCELLED',
        cancelledBy: 'user',
        reason: booking.cancel_reason,
      });
    }

    res.json({
      message: 'Booking cancelled.',
      cancellationFee,
      booking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Failed to cancel booking.' });
  }
};

/**
 * POST /api/bookings/:id/review
 * Submit a review for a completed booking.
 */
exports.submitReview = async (req, res) => {
  try {
    const { rating, comment, tags } = req.body;

    const booking = await Booking.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Can only review completed bookings.' });
    }

    const existingReview = await Review.findOne({ booking_id: booking._id });
    if (existingReview) {
      return res.status(409).json({ message: 'Review already submitted for this booking.' });
    }

    const review = await Review.create({
      booking_id: booking._id,
      user_id: req.user.id,
      provider_id: booking.provider_id,
      rating,
      comment: comment || '',
      tags: tags || [],
    });

    // Update provider average rating
    const allReviews = await Review.find({ provider_id: booking.provider_id });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Provider.findByIdAndUpdate(booking.provider_id, {
      average_rating: Math.round(avgRating * 10) / 10,
      total_reviews: allReviews.length,
    });

    res.status(201).json({ message: 'Review submitted.', review });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: 'Failed to submit review.' });
  }
};
