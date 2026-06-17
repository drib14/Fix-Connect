const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate); // All booking routes require authentication

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getMyBookings);
router.patch('/:id/status', bookingController.updateBookingStatus);

module.exports = router;
