const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  createDraft,
  requestProvider,
  getActiveBooking,
  getBookingHistory,
  getBookingById,
  cancelBooking,
  submitReview,
} = require('../controllers/bookingController');

router.post('/draft', auth, createDraft);
router.post('/:id/request', auth, requestProvider);
router.get('/active', auth, getActiveBooking);
router.get('/history', auth, getBookingHistory);
router.get('/:id', auth, getBookingById);
router.post('/:id/cancel', auth, cancelBooking);
router.post('/:id/review', auth, submitReview);

module.exports = router;
