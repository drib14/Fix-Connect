import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
const ctrl = new ReviewController();

router.get('/provider/:userId', ctrl.getProviderReviews);
router.post('/', protect, ctrl.createReview);

export default router;
