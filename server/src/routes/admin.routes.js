const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/workers/pending', authenticate, authorize('ADMIN'), adminController.getPendingWorkers);
router.patch('/workers/:id/verify', authenticate, authorize('ADMIN'), adminController.verifyWorker);
router.get('/stats', authenticate, authorize('ADMIN'), adminController.getStats);
router.get('/users', authenticate, authorize('ADMIN'), adminController.getUsers);
router.delete('/users/:id', authenticate, authorize('ADMIN'), adminController.deleteUser);
router.patch('/users/:id/status', authenticate, authorize('ADMIN'), adminController.updateUserStatus);
router.put('/users/:id', authenticate, authorize('ADMIN'), adminController.updateUserProfile);
router.get('/bookings', authenticate, authorize('ADMIN'), adminController.getBookings);
router.get('/bookings/:id', authenticate, authorize('ADMIN'), adminController.getBookingDetails);
router.patch('/bookings/:id/status', authenticate, authorize('ADMIN'), adminController.updateBookingStatus);
router.get('/payments', authenticate, authorize('ADMIN'), adminController.getPayments);
router.get('/reviews', authenticate, authorize('ADMIN'), adminController.getReviews);
router.delete('/reviews/:bookingId', authenticate, authorize('ADMIN'), adminController.deleteReview);

module.exports = router;
