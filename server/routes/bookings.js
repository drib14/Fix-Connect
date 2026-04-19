const express = require('express');
const router = express.Router();
const { createBooking, getBookings, getUserBookings, updateBookingStatus, getAvailableJobs, acceptJob, cancelBooking, getBookingById } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.get('/available', protect, getAvailableJobs);
router.get('/user/:userId', protect, getUserBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, updateBookingStatus);
router.put('/:id/accept', protect, acceptJob);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
