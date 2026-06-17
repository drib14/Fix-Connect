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
router.get('/bookings', authenticate, authorize('ADMIN'), adminController.getBookings);
router.get('/bookings/:id', authenticate, authorize('ADMIN'), adminController.getBookingDetails);
router.patch('/bookings/:id/status', authenticate, authorize('ADMIN'), adminController.updateBookingStatus);

module.exports = router;
