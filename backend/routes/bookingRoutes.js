import { Router } from 'express';
import { BookingController } from '../controllers/BookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
const ctrl = new BookingController();

// All routes require authentication
router.use(protect);

router.post('/', ctrl.createBooking);
router.get('/', ctrl.getMyBookings);
router.get('/slots/:providerId', ctrl.getAvailableSlots);
router.get('/:id', ctrl.getBookingById);
router.patch('/:id/status', ctrl.updateBookingStatus);

export default router;
