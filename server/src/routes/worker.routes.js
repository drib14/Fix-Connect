const express = require('express');
const workerController = require('../controllers/worker.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.get('/search', workerController.searchWorkers);
router.get('/:id', workerController.getWorkerById);

// Protected routes (any authenticated user can upload photos)
router.post('/upload', authenticate, workerController.uploadImage);

// Worker-specific routes
router.get('/profile/me', authenticate, authorize('WORKER'), workerController.getMyProfile);
router.put('/profile', authenticate, authorize('WORKER'), workerController.updateProfile);
router.post('/services', authenticate, authorize('WORKER'), workerController.addService);
router.delete('/services/:id', authenticate, authorize('WORKER'), workerController.deleteService);

module.exports = router;
