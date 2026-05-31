const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', protect, upload.array('images', 3), async (req, res) => {
  const {
    workerId,
    category,
    bookingDate,
    bookingTime,
    description,
    totalAmount,
    address,
    longitude,
    latitude,
  } = req.body;

  try {
    // Check if worker exists
    const worker = await User.findById(workerId);
    if (!worker || worker.role !== 'worker') {
      return res.status(404).json({ success: false, message: 'Selected professional not found' });
    }

    const imagePaths = req.files ? req.files.map((file) => file.path) : [];

    const booking = await Booking.create({
      customerId: req.user._id,
      workerId,
      category,
      bookingDate: new Date(bookingDate),
      bookingTime,
      description,
      totalAmount: parseFloat(totalAmount || 0),
      address,
      images: imagePaths,
      location: {
        type: 'Point',
        coordinates: [
          longitude ? parseFloat(longitude) : 0,
          latitude ? parseFloat(latitude) : 0,
        ],
      },
    });

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully',
      booking,
    });
  } catch (error) {
    console.error(`Create Booking Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/bookings/my-bookings
// @desc    Get user's personal bookings (client or worker)
// @access  Private
router.get('/my-bookings', protect, async (req, res) => {
  try {
    let bookings;

    if (req.user.role === 'worker') {
      // Find bookings requested from this worker
      bookings = await Booking.find({ workerId: req.user._id })
        .populate('customerId', 'name email phone avatar')
        .sort('-createdAt');
    } else {
      // Find bookings ordered by this customer
      bookings = await Booking.find({ customerId: req.user._id })
        .populate('workerId', 'name email phone avatar')
        .sort('-createdAt');
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(`Fetch Bookings Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking progress status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['accepted', 'rejected', 'in_progress', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status type' });
  }

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking record not found' });
    }

    // Authorization checks
    if (req.user.role === 'worker' && booking.workerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized profile' });
    }

    if (req.user.role === 'user' && booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized profile' });
    }

    // Role state restrictions
    if (status === 'cancelled' && req.user.role !== 'user') {
      return res.status(400).json({ success: false, message: 'Only customers can cancel orders' });
    }

    if (['accepted', 'rejected', 'in_progress', 'completed'].includes(status) && req.user.role !== 'worker') {
      return res.status(400).json({ success: false, message: 'Only workers can accept or update task progress' });
    }

    booking.status = status;
    
    // Support matchmaking re-routing redirect
    if (status === 'pending' && req.body.newWorkerId) {
      booking.workerId = req.body.newWorkerId;
    }
    
    // Automatically set payment status to paid upon completion as a simulation default if unpaid
    if (status === 'completed' && booking.paymentStatus === 'pending') {
      booking.paymentStatus = 'paid';
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (error) {
    console.error(`Update Booking Status Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/bookings/:id/review
// @desc    Write a service review for a worker
// @access  Private
router.post('/:id/review', protect, async (req, res) => {
  const { rating, reviewText } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Please provide rating between 1 and 5' });
  }

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking record not found' });
    }

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized user' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'You can only review completed services' });
    }

    if (booking.rating !== null) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this booking' });
    }

    booking.rating = rating;
    booking.reviewText = reviewText || '';
    await booking.save();

    // Recalculate Worker ratings and count
    const workerProfile = await WorkerProfile.findOne({ userId: booking.workerId });
    if (workerProfile) {
      const allCompletedBookings = await Booking.find({
        workerId: booking.workerId,
        rating: { $ne: null },
      });

      const totalReviews = allCompletedBookings.length;
      const sumRatings = allCompletedBookings.reduce((acc, curr) => acc + curr.rating, 0);
      const avgRating = totalReviews > 0 ? sumRatings / totalReviews : 5.0;

      workerProfile.rating = parseFloat(avgRating.toFixed(2));
      workerProfile.reviewCount = totalReviews;
      await workerProfile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Review submitted successfully',
      booking,
    });
  } catch (error) {
    console.error(`Review Submit Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
