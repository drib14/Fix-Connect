const Review = require('../models/Review');
const Worker = require('../models/Worker');
const Booking = require('../models/Booking');

exports.createReview = async (req, res) => {
  try {
    const { workerId, bookingId, rating, comment } = req.body;

    // Ensure booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    if (booking.status !== 'Completed') {
      return res.status(400).json({ message: 'Can only review completed bookings.' });
    }
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this booking.' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this booking.' });
    }

    const review = new Review({
      userId: req.user._id,
      workerId,
      bookingId,
      rating,
      comment
    });

    await review.save();

    // Update worker average rating
    const workerReviews = await Review.find({ workerId });
    const avgRating = workerReviews.reduce((acc, curr) => acc + curr.rating, 0) / workerReviews.length;

    await Worker.findByIdAndUpdate(workerId, {
      rating: parseFloat(avgRating.toFixed(1))
    });

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(500).json({ message: 'Failed to create review.' });
  }
};

exports.getWorkerReviews = async (req, res) => {
  try {
    const { workerId } = req.params;
    const reviews = await Review.find({ workerId }).populate('userId', 'name avatar').sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Get Reviews Error:', error);
    res.status(500).json({ message: 'Failed to get reviews.' });
  }
};
