import express from 'express';
import { PlatformController } from '../controllers/PlatformController.js';

const router = express.Router();
const platformController = new PlatformController();

router.get('/config', platformController.getConfig);
router.post('/newsletter', platformController.subscribeNewsletter);

export default router;
