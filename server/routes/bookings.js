const express = require('express');
const router = express.Router();
const { createBooking, getBookings, getUserBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.get('/user/:userId', protect, getUserBookings);
router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;
