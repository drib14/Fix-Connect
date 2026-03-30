const express = require('express');
const router = express.Router();
const { createBooking, getBookings, getUserBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.get('/user/:userId', protect, getUserBookings);

module.exports = router;
