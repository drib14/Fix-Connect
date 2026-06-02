import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { WorkerProfile } from '../models/WorkerProfile.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { emitNotification } from '../socket.js';
import { logger } from '../utils/logger.js';

export class ReviewController {
  // POST /api/reviews — Submit a review after completed booking
  createReview = async (req, res, next) => {
    try {
      const { bookingId, rating, comment, tags } = req.body;

      const booking = await Booking.findById(bookingId)
        .populate('provider', 'name')
        .populate('category', 'name');

      if (!booking) return next(new AppError('Booking not found', 404));
      if (booking.status !== 'completed') return next(new AppError('Can only review completed bookings', 400));
      if (String(booking.customer) !== req.user.id) return next(new AppError('Only the customer can review this booking', 403));
      if (booking.isReviewed) return next(new AppError('This booking has already been reviewed', 400));

      const review = await Review.create({
        booking: bookingId,
        reviewer: req.user.id,
        reviewee: booking.provider._id,
        rating,
        comment: comment || '',
        tags: tags || [],
      });

      // Mark booking as reviewed
      booking.isReviewed = true;
      await booking.save();

      // Recalculate provider's average rating
      const allReviews = await Review.find({ reviewee: booking.provider._id });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await WorkerProfile.findOneAndUpdate(
        { userId: booking.provider._id },
        {
          rating: Math.round(avgRating * 10) / 10,
          reviewsCount: allReviews.length,
        }
      );

      // Notify provider
      await emitNotification(String(booking.provider._id), {
        type: 'new_review',
        title: 'New Review Received',
        body: `You received a ${rating}-star review for your ${booking.category.name} service`,
        relatedBooking: bookingId,
        relatedUser: req.user.id,
        iconType: 'star',
      });

      logger.info(`Review created for booking ${bookingId}`);
      res.status(201).json({
        status: 'success',
        data: { review },
      });
    } catch (err) {
      if (err.code === 11000) {
        return next(new AppError('This booking has already been reviewed', 400));
      }
      next(err);
    }
  };

  // GET /api/reviews/provider/:userId
  getProviderReviews = async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [reviews, total] = await Promise.all([
        Review.find({ reviewee: req.params.userId })
          .populate('reviewer', 'name avatar')
          .populate('booking', 'referenceNumber scheduledAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        Review.countDocuments({ reviewee: req.params.userId }),
      ]);

      const avgRating = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;

      res.status(200).json({
        status: 'success',
        data: {
          reviews,
          avgRating: Math.round(avgRating * 10) / 10,
          total,
          pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
