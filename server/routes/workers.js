const express = require('express');
const router = express.Router();
const { getWorkers, applyWorker, getMyWorkerProfile, getCategories } = require('../controllers/workerController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getWorkers);
router.get('/categories', getCategories);
router.get('/me', protect, getMyWorkerProfile);
router.post('/', protect, upload.single('documents'), applyWorker);

module.exports = router;
