import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
const ctrl = new NotificationController();

router.use(protect);

router.get('/', ctrl.getNotifications);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', ctrl.markOneRead);
router.delete('/:id', ctrl.deleteNotification);

export default router;
