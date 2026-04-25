const express = require('express');
const router = express.Router();
const { getWorkers, applyWorker, getMyWorkerProfile, getCategories, getWorkerLocations, updateSettings } = require('../controllers/workerController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getWorkers);
router.get('/categories', getCategories);
router.get('/locations', getWorkerLocations);
router.get('/me', protect, getMyWorkerProfile);
router.put('/settings', protect, updateSettings);
router.post('/', protect, upload.single('documents'), applyWorker);

module.exports = router;
