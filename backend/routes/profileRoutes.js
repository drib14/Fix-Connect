import { Router } from 'express';
import { ProfileController, upload } from '../controllers/ProfileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
const ctrl = new ProfileController();

router.use(protect);

router.get('/', ctrl.getMyProfile);
router.put('/', ctrl.updateMyProfile);
router.post('/avatar', upload.single('avatar'), ctrl.uploadAvatar);
router.get('/provider', ctrl.getProviderProfile);
router.put('/provider', ctrl.updateProviderProfile);
router.get('/public/:userId', ctrl.getPublicProfile);

export default router;
