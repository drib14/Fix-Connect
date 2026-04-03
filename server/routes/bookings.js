const express = require('express');
const router = express.Router();
const { createBooking, getBookings, getUserBookings, updateBookingStatus, getAvailableJobs, acceptJob } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.get('/available', protect, getAvailableJobs);
router.get('/user/:userId', protect, getUserBookings);
router.put('/:id/status', protect, updateBookingStatus);
router.put('/:id/accept', protect, acceptJob);

module.exports = router;
