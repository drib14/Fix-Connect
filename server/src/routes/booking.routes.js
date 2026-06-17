const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authenticate, bookingController.createBooking);
router.get('/', authenticate, bookingController.getBookings);
router.get('/:id', authenticate, bookingController.getBookingById);
router.patch('/:id/status', authenticate, bookingController.updateBookingStatus);
router.post('/:id/chat', authenticate, bookingController.sendChatMessage);
router.post('/:id/review', authenticate, bookingController.createReview);

module.exports = router;
