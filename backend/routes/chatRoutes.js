import { Router } from 'express';
import { ChatController } from '../controllers/ChatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
const ctrl = new ChatController();

router.use(protect);

router.get('/conversations', ctrl.getConversations);
router.get('/:bookingId', ctrl.getMessages);
router.post('/:bookingId', ctrl.sendMessage);

export default router;
