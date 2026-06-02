import { Router } from 'express';
import { WorkerController } from '../controllers/WorkerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
const workerController = new WorkerController();

// Public Discovery APIs
router.get('/categories', workerController.getCategories);
router.get('/workers', workerController.getWorkers);

// Protected SaaS Onboarding APIs
router.post('/onboard/customer', protect, workerController.onboardCustomer);
router.post('/onboard/provider', protect, workerController.onboardProvider);

export default router;
