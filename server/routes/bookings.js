const express = require('express');
const router = express.Router();
const { createBooking, getBookings, getUserBookings } = require('../controllers/bookingController');

// For now, no authentication middleware as we're establishing the mock functionality per user instructions
router.post('/', createBooking);
router.get('/', getBookings);
router.get('/user/:userId', getUserBookings);

module.exports = router;
